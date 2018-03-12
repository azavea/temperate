import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { environment } from '../../../../environments/environment';
import { Action } from '../../../shared/';

import { ActionService } from '../../../core/services/action.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

import { ActionStepKey } from '../../action-step-key';
import { ActionWizardStepComponent } from '../../action-wizard-step.component';


interface AssessStepFormModel {
  name: string;
}

@Component({
  selector: 'app-action-assess-step',
  templateUrl: 'assess-step.component.html'
})
export class AssessStepComponent extends ActionWizardStepComponent<AssessStepFormModel>
                                 implements OnInit {

  public formValid: boolean;
  public key: ActionStepKey = ActionStepKey.Assess;
  public navigationSymbol = '1';
  public title = 'Overview';
  public action: Action;
  public textMaxLength = environment.actionTextMaxLength;

  constructor(protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected toastr: ToastrService,
              private fb: FormBuilder,
              protected router: Router,
              protected riskService: RiskService) {
    super(session, actionService, riskService, toastr, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.action = this.session.getData();
    this.setupForm(this.fromModel(this.action));
  }

  fromModel(action: Action): AssessStepFormModel {
    return {
       name: action.name
    };
  }

  getFormModel(): AssessStepFormModel {
    const data: AssessStepFormModel = {
      name: this.form.controls.name.value,
    };
    return data;
  }

  // return false if user is creating a new action and has nothing typed in
  shouldSave(): boolean {
    return !!this.action.id || (this.form.valid && !!this.form.controls.name.value);
  }

  setupForm(data: AssessStepFormModel) {
    this.form = this.fb.group({
      'name': [data.name ? data.name : '', [Validators.required]]
    });
  }

  toModel(data: AssessStepFormModel, model: Action): Action {
    model.name = data.name;

    return model;
  }

  isStepComplete(): boolean {
    return this.form.controls.name.valid;
  }
}
