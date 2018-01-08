import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import {
  OrgRiskDirectionalOption,
  OrgRiskDirectionalOptions,
  OrgRiskRelativeOption,
  OrgRiskRelativeChanceOptions,
  Risk,
  WizardStepComponent } from '../../../shared/';
import { RiskStepKey } from '../../risk-step-key';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

interface HazardStepFormModel {
  frequency: OrgRiskDirectionalOption;
  intensity: OrgRiskDirectionalOption;
  probability: OrgRiskRelativeOption;
}

@Component({
  selector: 'app-risk-step-hazard',
  templateUrl: 'hazard-step.component.html'
})

export class HazardStepComponent extends WizardStepComponent<Risk, HazardStepFormModel>
                                 implements OnInit {

  public form: FormGroup;
  public key = RiskStepKey.Hazard;
  public navigationSymbol = '2';
  public risk: Risk;
  public title = 'Hazard';
  public tooltipText = {
    frequency: 'Estimation of the change in how often this hazard will occur in the future',
    intensity: 'Estimation of the change in strength of this hazard in the future'
  };

  public directionalOptions = OrgRiskDirectionalOptions;
  public relativeOptions = OrgRiskRelativeChanceOptions;
  // Can't *ngFor a map type or iterable, so instead we realize the iterable and use that in *ngFors
  public directionalOptionsKeys = Array.from(OrgRiskDirectionalOptions.keys());
  public relativeOptionsKeys = Array.from(OrgRiskRelativeChanceOptions.keys());

  constructor(private fb: FormBuilder,
              protected session: WizardSessionService<Risk>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData() || new Risk({});
    this.setupForm(this.fromModel(this.risk));
    this.form.get('intensity').valueChanges.subscribe(v => console.log('intensity: ', v));
  }

  getFormModel(): HazardStepFormModel {
    const data: HazardStepFormModel = {
      frequency: this.form.controls.frequency.value,
      intensity: this.form.controls.intensity.value,
      probability: this.form.controls.probability.value
    };
    return data;
  }

  updateDirectionalControl(control: FormControl, value: OrgRiskDirectionalOption) {
    control.setValue(value);
    control.markAsDirty();
  }

  setupForm(data: HazardStepFormModel) {
    this.form = this.fb.group({
      'frequency': [data.frequency, []],
      'intensity': [data.intensity, []],
      'probability': [data.probability, []],
    });
  }

  fromModel(model: Risk): HazardStepFormModel {
    return {
      frequency: model.frequency,
      intensity: model.intensity,
      probability: model.probability
    };
  }

  toModel(data: HazardStepFormModel, model: Risk) {
    model.frequency = data.frequency;
    model.intensity = data.intensity;
    model.probability = data.probability;
    return model;
  }
}
