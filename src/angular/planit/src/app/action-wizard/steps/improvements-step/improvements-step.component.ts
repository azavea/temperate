import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ActionStepKey } from '../../action-step-key';
import { Collaborator } from '../../../shared/models/collaborator.model';
import { Action, WizardStepComponent } from '../../../shared/';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

import { CollaboratorService } from '../../../core/services/collaborator.service';

interface ImprovementsStepFormModel {
  collaborators: string[];
  improvementsAdaptiveCapacity: string;
  improvementsImpacts: string;
}

@Component({
  selector: 'app-action-improvements-step',
  templateUrl: './improvements-step.component.html'
})
export class ImprovementsStepComponent
          extends WizardStepComponent<Action, ImprovementsStepFormModel>
          implements OnInit {
  public form: FormGroup;
  public key = ActionStepKey.Improvements;
  public navigationSymbol = '3';
  public title = 'Improvements';
  public collaboratorValues: string[];

  constructor(private fb: FormBuilder,
              protected session: WizardSessionService<Action>,
              protected collaboratorService: CollaboratorService) {
    super(session);
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
      improvementsAdaptiveCapacity: this.form.controls.improvementsAdaptiveCapacity.value,
      improvementsImpacts: this.form.controls.improvementsImpacts.value
    };
    return data;
  }

  setupForm(data: ImprovementsStepFormModel) {
    this.form = this.fb.group({
      'collaborators': [data.collaborators, []],
      'improvementsAdaptiveCapacity': [data.improvementsAdaptiveCapacity, []],
      'improvementsImpacts': [data.improvementsImpacts, []]
    });
  }

  fromModel(model: Action): ImprovementsStepFormModel {
    return {
      collaborators: model.collaborators,
      improvementsAdaptiveCapacity: model.improvementsAdaptiveCapacity,
      improvementsImpacts: model.improvementsImpacts
    };
  }

  toModel(data: ImprovementsStepFormModel, model: Action) {
    model.collaborators = data.collaborators;
    model.improvementsAdaptiveCapacity = data.improvementsAdaptiveCapacity;
    model.improvementsImpacts = data.improvementsImpacts;
    return model;
  }
}
