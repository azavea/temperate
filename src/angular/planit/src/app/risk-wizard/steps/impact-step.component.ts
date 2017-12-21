import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Risk } from '../../shared/';
import { ImpactStepFormModel } from './impact-step-form.model';
import { WizardStepComponent } from '../wizard-step.component';
import { RiskStepKey } from '../risk-step-key';
import { WizardSessionService } from '../wizard-session.service';

@Component({
  selector: 'app-risk-step-impact',
  templateUrl: 'impact-step.component.html'
})

export class ImpactStepComponent extends WizardStepComponent<Risk> implements OnInit {

  public form: FormGroup;
  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Impact;
  public navigationSymbol = '3';
  public title = 'Impact';

  public magnitudes =  ['Serious', 'Vserious'];

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

  fromData(risk: Risk): ImpactStepFormModel {
    return {
      impactMagnitude: risk.impactMagnitude,
      impactDescription: risk.impactDescription
    };
  }

  cancel() {
    this.router.navigate(['assessment']);
  }

  save() {
    const data = {
      impactMagnitude: this.form.controls.impactMagnitude.value,
      impactDescription: this.form.controls.impactDescription.value
    };
    this.session.setDataForKey(this.key, data);
  }

  setupForm(data: ImpactStepFormModel) {
    this.form = this.fb.group({
      'impactMagnitude': [data.impactMagnitude, Validators.required],
      'impactDescription': [data.impactDescription, Validators.required]
    });
  }

  toData(data: ImpactStepFormModel, risk: Risk) {
    risk.impactMagnitude = data.impactMagnitude;
    risk.impactDescription = data.impactDescription;
    return risk;
  }
}
