import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Risk } from '../../shared/';
import { CapacityStepFormModel } from './capacity-step-form.model';
import { WizardStepComponent } from '../wizard-step.component';
import { RiskStepKey } from '../risk-step-key';
import { WizardSessionService } from '../wizard-session.service';


@Component({
  selector: 'app-risk-step-capacity',
  templateUrl: 'capacity-step.component.html'
})

export class CapacityStepComponent extends WizardStepComponent<Risk> implements OnInit {

  public form: FormGroup;
  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Capacity;
  public navigationSymbol = '4';
  public title = 'Adaptive capacity';

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

  fromData(risk: Risk): CapacityStepFormModel {
    return {
      adaptiveCapacity: risk.adaptiveCapacity,
      adaptiveCapacityDescription: risk.adaptiveCapacityDescription
    };
  }

  cancel() {
    this.router.navigate(['assessment']);
  }

  save() {
    const data = {
      adaptiveCapacity: this.form.controls.adaptiveCapacity.value,
      adaptiveCapacityDescription: this.form.controls.adaptiveCapacityDescription.value
    };
    this.session.setDataForKey(this.key, data);
  }

  setupForm(data: CapacityStepFormModel) {
    this.form = this.fb.group({
      'adaptiveCapacity': [data.adaptiveCapacity, Validators.required],
      'adaptiveCapacityDescription': [data.adaptiveCapacityDescription, Validators.required]
    });
  }

  toData(data: CapacityStepFormModel, risk: Risk) {
    risk.adaptiveCapacity = data.adaptiveCapacity;
    risk.adaptiveCapacityDescription = data.adaptiveCapacityDescription;
    return risk;
  }
}
