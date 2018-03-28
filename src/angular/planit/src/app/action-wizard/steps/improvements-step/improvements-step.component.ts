import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Subscription';

import { ActionService } from '../../../core/services/action.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { Action, Risk } from '../../../shared/';
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
          implements OnInit, OnDestroy {

  @Input() risk: Risk;

  public action: Action;
  public key = ActionStepKey.Improvements;
  public navigationSymbol = '3';
  public title = 'Outcomes';
  public collaboratorValues: string[];
  private sessionSubscription: Subscription;

  constructor(protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected toastr: ToastrService,
              protected router: Router,
              private fb: FormBuilder,
              private collaboratorService: CollaboratorService,
              protected riskService: RiskService) {
    super(session, actionService, riskService, toastr, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.action = this.session.getData();
    this.setupForm(this.fromModel(this.action));

    this.collaboratorValues = [];
    this.collaboratorService.list().subscribe(collaborators => {
      // Create a list of collaborator suggestions to display to the user
      this.collaboratorValues = collaborators.map(c => c.name);
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

  isStepComplete() {
    return !!this.form.controls.improvements_adaptive_capacity.value &&
      !!this.form.controls.improvements_impacts.value;
  }
}
