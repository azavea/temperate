import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Risk } from '../../shared/';
import { WizardStepComponent } from '../wizard-step.component';
import { RiskStepKey } from '../risk-step-key';
import { WizardSessionService } from '../wizard-session.service';

interface IdentifyStepFormModel {
  hazard: string;
  communitySystem: string;
}

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

  public hazards: string[];
  public hazard: string;

  public communitySystems: string[];
  public communitySystem: string;

  constructor(private fb: FormBuilder,
              private router: Router,
              protected session: WizardSessionService<Risk>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    const risk = this.session.getData();
    this.setupForm(this.fromModel(risk));

    this.hazards = ['one', 'two', 'three'];
    this.communitySystems = ['four', 'five', 'six'];
  }

  cancel() {
    this.router.navigate(['assessment']);
  }

  fromModel(risk: Risk): IdentifyStepFormModel {
    return {
      hazard: risk.weatherEvent.name,
      communitySystem: risk.communitySystem.name
    };
  }

  save() {
    const data: IdentifyStepFormModel = {
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

  toModel(data: IdentifyStepFormModel, risk: Risk) {
    risk.weatherEvent.name = data.hazard;
    risk.communitySystem.name = data.communitySystem;
    return risk;
  }
}
