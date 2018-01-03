import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import {  OrgRiskRelativeOption,
          OrgRiskRelativeChanceOptions,
          Risk,
          WizardStepComponent } from '../../../shared/';
import { RiskStepKey } from '../../risk-step-key';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

export interface CapacityStepFormModel {
  adaptiveCapacity: OrgRiskRelativeOption;
  relatedAdaptiveValues: string[];
  adaptiveCapacityDescription: string;
}
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
  public risk: Risk;

  public relativeOptions = OrgRiskRelativeChanceOptions;
  // Can't *ngFor a map type or iterable, so instead we realize the iterable and use that in *ngFors
  public relativeOptionsKeys = Array.from(OrgRiskRelativeChanceOptions.keys());

  // TODO (issue #241): Replace related adaptive values select with the fancy select
  // autocomplete from issue #218
  public examples: string[] = ['1', '2', '3'];

  constructor(private fb: FormBuilder,
              protected session: WizardSessionService<Risk>) {
      super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData() || new Risk({});
    this.setupForm(this.fromModel(this.risk));
  }

  fromModel(model: Risk): CapacityStepFormModel {
    return {
      adaptiveCapacity: model.adaptiveCapacity,
      relatedAdaptiveValues: model.relatedAdaptiveValues,
      adaptiveCapacityDescription: model.adaptiveCapacityDescription
    };
  }

  save() {
    const data: CapacityStepFormModel = {
      adaptiveCapacity: this.form.controls.adaptiveCapacity.value,
      relatedAdaptiveValues: [],
      adaptiveCapacityDescription: this.form.controls.adaptiveCapacityDescription.value
    };
    this.session.setDataForKey(this.key, data);

    // mark step as complete for style change
    if (!this.form.pristine && this.form.valid) {
      document.querySelector('li[step-symbol="' + this.navigationSymbol + '"')
              .classList
              .add('complete');
    }
  }

  setupForm(data: CapacityStepFormModel) {
    this.form = this.fb.group({
      'adaptiveCapacity': [data.adaptiveCapacity, []],
      'relatedAdaptiveValues': [[], []],
      'adaptiveCapacityDescription': [data.adaptiveCapacityDescription, []]
    });
  }

  toModel(data: CapacityStepFormModel, model: Risk) {
    model.adaptiveCapacity = data.adaptiveCapacity;
    model.relatedAdaptiveValues = data.relatedAdaptiveValues;
    model.adaptiveCapacityDescription = data.adaptiveCapacityDescription;
    return model;
  }
}
