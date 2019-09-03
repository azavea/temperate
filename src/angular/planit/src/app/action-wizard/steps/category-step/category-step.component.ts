import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { ActionCategoryService } from '../../../core/services/action-category.service';
import { ActionService } from '../../../core/services/action.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { Action, ActionCategory, Risk } from '../../../shared/';
import { ActionStepKey } from '../../action-step-key';
import { ActionWizardStepComponent } from '../../action-wizard-step.component';

@Component({
  selector: 'app-action-category-step',
  templateUrl: './category-step.component.html'
})
export class CategoryStepComponent extends ActionWizardStepComponent<ActionCategory[]>
                                   implements OnInit, OnDestroy {

  @Input() risk: Risk;

  public navigationSymbol = '4';
  public title = 'Categories';
  public key = ActionStepKey.Category;

  public action: Action;
  public actionCategories: ActionCategory[] = [];
  private sessionSubscription: Subscription;

  constructor(protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected toastr: ToastrService,
              protected router: Router,
              private fb: FormBuilder,
              private actionCategoryService: ActionCategoryService,
              protected riskService: RiskService) {
    super(session, actionService, riskService, toastr, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.action = this.session.getData();
    this.actionCategoryService.list().subscribe(categories => {
      this.actionCategories = categories;
      this.setupForm(this.fromModel(this.session.getData() || new Action({})));
    });

    this.setDisabled(this.action);
    this.sessionSubscription = this.session.data.subscribe(action => {
      this.action = action;
      this.setDisabled(action);
    });
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
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

  shouldSave() {
    return !!this.action.name;
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

  isStepComplete() {
    return this.getFormModel().length > 0;
  }

}
