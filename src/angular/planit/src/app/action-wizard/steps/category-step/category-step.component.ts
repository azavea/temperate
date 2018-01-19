import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { ActionCategoryService } from '../../../core/services/action-category.service';
import { ActionService } from '../../../core/services/action.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { Action, ActionCategory } from '../../../shared/';
import { ActionStepKey } from '../../action-step-key';
import { ActionWizardStepComponent } from '../../action-wizard-step.component';

@Component({
  selector: 'app-action-category-step',
  templateUrl: './category-step.component.html'
})
export class CategoryStepComponent extends ActionWizardStepComponent<ActionCategory[]>
                                   implements OnInit {

  public navigationSymbol = '4';
  public title = 'Categories';
  public key = ActionStepKey.Category;

  public actionCategories: ActionCategory[];

  constructor(protected fb: FormBuilder,
              protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected toastr: ToastrService,
              private actionCategoryService: ActionCategoryService) {
    super(fb, session, actionService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();

    this.actionCategoryService.list().subscribe(categories => {
      this.actionCategories = categories;
      this.setupForm(this.fromModel(this.session.getData() || new Action({})));
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
    // action categories are managed outside the form
    this.form = this.fb.group({});

    if (!this.actionCategories) {
      console.warn('Cannot set up category step form until action categories loaded');
      return;
    }

    if (!data) {
      return; // no action categories set on action model yet
    }

    // mark action categories from the Action model as `selected` for UI presentation
    for (const category of data) {
      const match: ActionCategory = this.actionCategories.find(function(cat) {
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
