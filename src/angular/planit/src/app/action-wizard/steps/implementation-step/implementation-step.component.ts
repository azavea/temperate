import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Subscription';

import { ActionTypeService } from '../../../core/services/action-type.service';
import { ActionService } from '../../../core/services/action.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { Action, ActionVisibilityOption, Risk } from '../../../shared/';
import { ActionStepKey } from '../../action-step-key';
import { ActionWizardStepComponent } from '../../action-wizard-step.component';

interface ActionDetailsFormModel {
  action_goal: string;
  action_type: string;
  implementation_details: string;
  notes: string;
  isPublic: boolean;
}

@Component({
  selector: 'app-action-implementation-step',
  templateUrl: './implementation-step.component.html'
})
export class ImplementationStepComponent
  extends ActionWizardStepComponent<ActionDetailsFormModel> implements OnInit, OnDestroy {

  @Input() risk: Risk;

  public action: Action;
  public actionTypes: string[] = [];
  public key: ActionStepKey = ActionStepKey.Implementation;
  public navigationSymbol = '2';
  public title = 'Details';
  private sessionSubscription: Subscription;

  constructor(protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected toastr: ToastrService,
              private fb: FormBuilder,
              protected router: Router,
              private actionTypeService: ActionTypeService,
              protected riskService: RiskService) {
    super(session, actionService, riskService, toastr, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.action = this.session.getData();
    this.setupForm(this.fromModel(this.action));

    this.actionTypeService.nameList().subscribe(data => this.actionTypes = data);

    this.setDisabled(this.action);
    this.sessionSubscription = this.session.data.subscribe(action => {
      this.action = action;
      this.setDisabled(action);
    });
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
  }

  public fromModel(model: Action) {
    return {
      action_goal: model.action_goal,
      action_type: model.action_type,
      implementation_details: model.implementation_details,
      notes: model.implementation_notes,
      isPublic: model.visibility === ActionVisibilityOption.Public
    };
  }

  public getFormModel() {
    return {
      action_goal: this.form.controls.action_goal.value,
      action_type: this.form.controls.action_type.value,
      implementation_details: this.form.controls.implementation_details.value,
      notes: this.form.controls.notes.value,
      isPublic: this.form.controls.isPublic.value
    };
  }

  public setupForm(data: ActionDetailsFormModel) {
    this.form = this.fb.group({
      'action_goal': [data.action_goal, []],
      'action_type': [data.action_type, []],
      'implementation_details': [data.implementation_details, []],
      'notes': [data.notes, []],
      'isPublic': [data.isPublic, []]
    });
  }

  public toModel(data: ActionDetailsFormModel, model: Action) {
    model.action_goal = data.action_goal;
    model.action_type = data.action_type;
    model.implementation_details = data.implementation_details;
    model.implementation_notes = data.notes;
    model.visibility = (data.isPublic ? ActionVisibilityOption.Public :
                        ActionVisibilityOption.Private);
    return model;
  }

  public updateIsPublic(value: boolean) {
    this.form.controls.isPublic.setValue(value);
    this.form.controls.isPublic.markAsDirty();
  }

  isStepComplete() {
    return !!this.form.controls.action_goal.value && !!this.form.controls.action_type.value;
  }
}
