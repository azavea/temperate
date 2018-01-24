import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { ActionService } from '../../../core/services/action.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { Action } from '../../../shared/';
import { Collaborator } from '../../../shared/models/collaborator.model';
import { ActionStepKey } from '../../action-step-key';
import { ActionWizardStepComponent } from '../../action-wizard-step.component';

import { CollaboratorService } from '../../../core/services/collaborator.service';

interface ImprovementsStepFormModel {
  collaborators: string[];
  improvements_adaptive_capacity: string;
  improvements_impacts: string;
}

@Component({
  selector: 'app-action-improvements-step',
  templateUrl: './improvements-step.component.html'
})
export class ImprovementsStepComponent
          extends ActionWizardStepComponent<ImprovementsStepFormModel>
          implements OnInit {
  public key = ActionStepKey.Improvements;
  public navigationSymbol = '3';
  public title = 'Improvements';
  public collaboratorValues: string[];

  constructor(protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected toastr: ToastrService,
              private fb: FormBuilder,
              private collaboratorService: CollaboratorService) {
    super(session, actionService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    const action = this.session.getData();
    this.setupForm(this.fromModel(action));

    this.collaboratorValues = [];
    this.collaboratorService.list().subscribe(collaborators => {
      // Create a list of collaborator suggestions to display to the user
      this.collaboratorValues = collaborators.map(c => c.name);
    });
  }

  getFormModel(): ImprovementsStepFormModel {
    const data: ImprovementsStepFormModel = {
      collaborators: this.form.controls.collaborators.value,
      improvements_adaptive_capacity: this.form.controls.improvements_adaptive_capacity.value,
      improvements_impacts: this.form.controls.improvements_impacts.value
    };
    return data;
  }

  setupForm(data: ImprovementsStepFormModel) {
    this.form = this.fb.group({
      'collaborators': [data.collaborators, []],
      'improvements_adaptive_capacity': [data.improvements_adaptive_capacity, []],
      'improvements_impacts': [data.improvements_impacts, []]
    });
  }

  fromModel(model: Action): ImprovementsStepFormModel {
    return {
      collaborators: model.collaborators,
      improvements_adaptive_capacity: model.improvements_adaptive_capacity,
      improvements_impacts: model.improvements_impacts
    };
  }

  toModel(data: ImprovementsStepFormModel, model: Action) {
    model.collaborators = data.collaborators;
    model.improvements_adaptive_capacity = data.improvements_adaptive_capacity;
    model.improvements_impacts = data.improvements_impacts;
    return model;
  }
}
