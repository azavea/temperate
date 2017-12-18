import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Risk } from '../../shared/';
import { IdentifyStepFormModel } from './identify-step-form.model';
import { RiskStepComponent } from './risk-step.component';
import { RiskStepKey } from '../risk-step-key';
import { RiskWizardSessionService } from '../risk-wizard-session.service';

@Component({
  selector: 'app-risk-step-identify',
  templateUrl: 'identify-step.component.html'
})

export class IdentifyStepComponent extends RiskStepComponent implements OnInit {

  public form: FormGroup;
  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Identify;
  public navigationSymbol = '1';
  public title = 'Identify risk';

  constructor(private fb: FormBuilder,
              private router: Router,
              protected session: RiskWizardSessionService) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    const risk = this.session.getRisk() || new Risk({});
    this.setupForm(this.fromRisk(risk));
  }

  cancel() {
    this.router.navigate(['assessment']);
  }

  fromRisk(risk: Risk): IdentifyStepFormModel {
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

  toRisk(data: IdentifyStepFormModel, risk: Risk) {
    risk.hazard = data.hazard;
    risk.communitySystem = data.communitySystem;
    return risk;
  }
}
