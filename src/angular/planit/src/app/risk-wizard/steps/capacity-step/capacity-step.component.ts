import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import {  OrgRiskRelativeOption,
          OrgRiskRelativeChanceOptions,
          Risk,
          WizardStepComponent } from '../../../shared/';
import { RiskStepKey } from '../../risk-step-key';
import { RelatedAdaptiveValueService } from '../../../core/services/related-adaptive-value.service';
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

export class CapacityStepComponent extends WizardStepComponent<Risk, CapacityStepFormModel>
                                   implements OnInit {
  public form: FormGroup;
  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Capacity;
  public navigationSymbol = '4';
  public title = 'Adaptive capacity';
  public risk: Risk;

  public relativeOptions = OrgRiskRelativeChanceOptions;
  // Can't *ngFor a map type or iterable, so instead we realize the iterable and use that in *ngFors
  public relativeOptionsKeys = Array.from(OrgRiskRelativeChanceOptions.keys());

  public adaptiveValues: string[] = [];

  constructor(private fb: FormBuilder,
              private relatedAdaptiveValueService: RelatedAdaptiveValueService,
              protected session: WizardSessionService<Risk>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData() || new Risk({});
    this.setupForm(this.fromModel(this.risk));
    this.relatedAdaptiveValueService.list()
      .subscribe(adaptiveValues => {
        this.adaptiveValues = adaptiveValues.map(av => av.name);
      });
  }

  fromModel(model: Risk): CapacityStepFormModel {
    return {
      adaptiveCapacity: model.adaptiveCapacity,
      relatedAdaptiveValues: model.relatedAdaptiveValues,
      adaptiveCapacityDescription: model.adaptiveCapacityDescription
    };
  }

  getFormModel(): CapacityStepFormModel {
    const data: CapacityStepFormModel = {
      adaptiveCapacity: this.form.controls.adaptiveCapacity.value,
      relatedAdaptiveValues: this.form.controls.relatedAdaptiveValues.value,
      adaptiveCapacityDescription: this.form.controls.adaptiveCapacityDescription.value
    };
    return data;
  }

  setupForm(data: CapacityStepFormModel) {
    this.form = this.fb.group({
      'adaptiveCapacity': [data.adaptiveCapacity, []],
      'relatedAdaptiveValues': [data.relatedAdaptiveValues, []],
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
