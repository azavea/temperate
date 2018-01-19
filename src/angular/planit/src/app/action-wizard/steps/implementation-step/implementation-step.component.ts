import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ActionTypeService } from '../../../core/services/action-type.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { Action, ActionVisibility } from '../../../shared/';
import { WizardStepComponent } from '../../../shared/wizard/wizard-step.component';
import { ActionStepKey } from '../../action-step-key';

interface ActionDetailsFormModel {
  actionGoal: string;
  actionType: string;
  implementationDetails: string;
  notes: string;
  isPublic: boolean;
}

@Component({
  selector: 'app-action-implementation-step',
  templateUrl: './implementation-step.component.html'
})
export class ImplementationStepComponent
  extends WizardStepComponent<Action, ActionDetailsFormModel> implements OnInit {

  public actionTypes: string[] = [];
  public form: FormGroup;
  public key: ActionStepKey = ActionStepKey.Implementation;
  public navigationSymbol = '2';
  public title = 'Action details';
  public tooltipText = {
    shareWithCities: 'If \'public\' is selected, other organizations in Temperate will be able ' +
                     'to view this action and use it as a template for their own vulnerability ' +
                     'assessments'
  };

  constructor(private actionTypeService: ActionTypeService,
              private fb: FormBuilder,
              protected session: WizardSessionService<Action>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    const action = this.session.getData() || new Action({});
    this.setupForm(this.fromModel(action));

    this.actionTypeService.nameList().subscribe(data => this.actionTypes = data);
  }

  public fromModel(model: Action) {
    return {
      actionGoal: model.actionGoal,
      actionType: model.actionType,
      implementationDetails: model.implementationDetails,
      notes: model.implementationNotes,
      isPublic: model.visibility === ActionVisibility.Public
    };
  }

  public getFormModel() {
    return {
      actionGoal: this.form.controls.actionGoal.value,
      actionType: this.form.controls.actionType.value,
      implementationDetails: this.form.controls.implementationDetails.value,
      notes: this.form.controls.notes.value,
      isPublic: this.form.controls.isPublic.value
    };
  }

  public setupForm(data: ActionDetailsFormModel) {
    this.form = this.fb.group({
      'actionGoal': [data.actionGoal, []],
      'actionType': [data.actionType, []],
      'implementationDetails': [data.implementationDetails, []],
      'notes': [data.notes, []],
      'isPublic': [data.isPublic, []]
    });
  }

  public toModel(data: ActionDetailsFormModel, model: Action) {
    model.actionGoal = data.actionGoal;
    model.actionType = data.actionType;
    model.implementationDetails = data.implementationDetails;
    model.implementationNotes = data.notes;
    model.visibility = data.isPublic ? ActionVisibility.Public : ActionVisibility.Private;
    return model;
  }

  public updateIsPublic(value: boolean) {
    this.form.controls.isPublic.setValue(value);
    this.form.controls.isPublic.markAsDirty();
  }
}
