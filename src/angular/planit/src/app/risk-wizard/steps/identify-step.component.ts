import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Risk } from '../../shared/';
import { IdentifyStepFormModel } from './identify-step-form.model';
import { WizardStepComponent } from '../wizard-step.component';
import { RiskStepKey } from '../risk-step-key';
import { WizardSessionService } from '../wizard-session.service';

@Component({
  selector: 'app-risk-step-identify',
  templateUrl: 'identify-step.component.html'
})

export class IdentifyStepComponent extends WizardStepComponent<Risk> implements OnInit {

  public form: FormGroup;
  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Identify;
  public navigationSymbol = '1';
  public title = 'Identify risk';

  constructor(private fb: FormBuilder,
              private router: Router,
              protected session: WizardSessionService<Risk>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    const risk = this.session.getData() || new Risk({});
    this.setupForm(this.fromData(risk));
  }

  cancel() {
    this.router.navigate(['assessment']);
  }

  fromData(risk: Risk): IdentifyStepFormModel {
    return {
      hazard: risk.hazard,
      communitySystem: risk.communitySystem
    };
  }

  save() {
    const data = {
      hazard: this.form.controls.hazard.value,
      communitySystem: this.form.controls.communitySystem.value
    };
    this.session.setDataForKey(this.key, data);
  }

  setupForm(data: IdentifyStepFormModel) {
    this.form = this.fb.group({
      'hazard': [data.hazard, Validators.required],
      'communitySystem': [data.communitySystem, Validators.required]
    });
  }

  toData(data: IdentifyStepFormModel, risk: Risk) {
    risk.hazard = data.hazard;
    risk.communitySystem = data.communitySystem;
    return risk;
  }
}
