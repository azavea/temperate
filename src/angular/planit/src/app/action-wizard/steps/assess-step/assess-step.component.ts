import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { Action, Risk } from '../../../shared/';

import { ActionService } from '../../../core/services/action.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

import { ActionStepKey } from '../../action-step-key';
import { ActionWizardStepComponent } from '../../action-wizard-step.component';

interface AssessStepFormModel {
  name: string;
}

interface NamedRisk {
  name: string;
  risk: Risk;
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
  public title = 'General Information';

  public namedRisk: NamedRisk;

  constructor(protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected toastr: ToastrService,
              private fb: FormBuilder,
              private router: Router,
              private riskService: RiskService) {
    super(session, actionService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    const action = this.session.getData();
    this.setupForm(this.fromModel(action));

    this.riskService.get(action.risk).subscribe(risk => {
      this.namedRisk = {
        'risk': risk,
        'name': `${risk.weather_event.name} on ${risk.community_system.name}`};
    });
  }

  cancel () {
    // TODO: if have action text entered, save before exiting wizard
    if (this.form.valid) {
      console.log('going to save...');
    } else {
      console.log('form not valid! should cancel without save');
    }
    this.router.navigate(['actions'],
      {'queryParams': {'hazard': this.namedRisk.risk.weather_event.id}});
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

  setupForm(data: AssessStepFormModel) {
    this.form = this.fb.group({
      'name': [data.name ? data.name : '', [Validators.required]]
    });
  }

  toModel(data: AssessStepFormModel, model: Action) {
    model.name = data.name;

    return model;
  }

  isStepComplete(): boolean {
    return this.form.controls.name.valid;
  }
}
