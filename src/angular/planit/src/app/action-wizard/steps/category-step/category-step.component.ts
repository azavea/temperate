import { Component, OnInit } from '@angular/core';

import { Action, ActionCategory, WizardStepComponent } from '../../../shared/';
import { ActionCategoryService } from '../../../core/services/action-category.service';
import { ActionStepKey } from '../../action-step-key';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

@Component({
  selector: 'app-action-category-step',
  templateUrl: './category-step.component.html'
})
export class CategoryStepComponent extends WizardStepComponent<Action, ActionCategory[]>
                                   implements OnInit {

  public navigationSymbol = '4';
  public title = 'Categories';
  public form = null; // no form, just buttons
  public key = ActionStepKey.Category;

  public action: Action;
  public actionCategories: ActionCategory[];

  constructor(private actionCategoryService: ActionCategoryService,
              protected session: WizardSessionService<Action>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    this.action = this.session.getData() || new Action({});

    this.actionCategoryService.list().subscribe(categories => {
      this.actionCategories = categories;
      this.setupForm(this.fromModel(this.action));
    });
  }

  // check if any of the action categories have been selected
  public haveSelectedActionCategory(): boolean {
    return this.actionCategories && !!this.actionCategories.find(function(cat: ActionCategory) {
      return cat.selected;
    });
  }

  // toggle button selections on click
  public selectActionCategory(actionCategory: ActionCategory) {
    actionCategory.selected = !actionCategory.selected;
  }

  fromModel(model: Action): ActionCategory[] {
    return model.categories;
  }

  getFormModel(): ActionCategory[] {
    return this.actionCategories.filter(function(cat: ActionCategory) {
      return cat.selected;
    });
  }

  setupForm(data: ActionCategory[]) {
    if (!this.actionCategories) {
      console.warn('Cannot set up category step form until action categories loaded');
      return;
    }

    if (!data) {
      return; // no action categories set on action model yet
    }

    // mark action categories from the Action model as `selected` for UI presentation
    for (const category of data) {
      const match: ActionCategory = this.actionCategories.find(function(cat: ActionCategory) {
        return cat.id === category.id;
      });

      if (match) {
        match.selected = true;
      } else {
        console.warn('Action model has unrecognized category set: ' + category.name);
      }
    }
  }

  toModel(data: ActionCategory[], model: Action): Action {
    model.categories = data;
    return model;
  }

}
