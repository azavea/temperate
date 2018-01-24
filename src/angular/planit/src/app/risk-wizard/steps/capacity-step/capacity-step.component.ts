import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { RelatedAdaptiveValueService } from '../../../core/services/related-adaptive-value.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import {
  OrgRiskRelativeChanceOptions,
  OrgRiskRelativeOption,
  Risk
} from '../../../shared/';
import { RiskStepKey } from '../../risk-step-key';
import { RiskWizardStepComponent } from '../../risk-wizard-step.component';

export interface CapacityStepFormModel {
  adaptive_capacity: OrgRiskRelativeOption;
  related_adaptive_values: string[];
  adaptive_capacity_description: string;
}

@Component({
  selector: 'app-risk-step-capacity',
  templateUrl: 'capacity-step.component.html'
})
export class CapacityStepComponent extends RiskWizardStepComponent<CapacityStepFormModel>
                                   implements OnInit {
  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Capacity;
  public navigationSymbol = '4';
  public title = 'Adaptive capacity';
  public risk: Risk;

  public relativeOptions = OrgRiskRelativeChanceOptions;
  // Can't *ngFor a map type or iterable, so instead we realize the iterable and use that in *ngFors
  public relativeOptionsKeys = Array.from(OrgRiskRelativeChanceOptions.keys());

  public adaptiveValues: string[] = [];

  constructor(protected session: WizardSessionService<Risk>,
              protected riskService: RiskService,
              protected toastr: ToastrService,
              private fb: FormBuilder,
              private relatedAdaptiveValueService: RelatedAdaptiveValueService) {
    super(session, riskService, toastr);
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
      adaptive_capacity: model.adaptive_capacity,
      related_adaptive_values: model.related_adaptive_values,
      adaptive_capacity_description: model.adaptive_capacity_description
    };
  }

  getFormModel(): CapacityStepFormModel {
    const data: CapacityStepFormModel = {
      adaptive_capacity: this.form.controls.adaptive_capacity.value,
      related_adaptive_values: this.form.controls.related_adaptive_values.value,
      adaptive_capacity_description: this.form.controls.adaptive_capacity_description.value
    };
    return data;
  }

  setupForm(data: CapacityStepFormModel) {
    this.form = this.fb.group({
      'adaptive_capacity': [data.adaptive_capacity, []],
      'related_adaptive_values': [data.related_adaptive_values, []],
      'adaptive_capacity_description': [data.adaptive_capacity_description, []]
    });
  }

  toModel(data: CapacityStepFormModel, model: Risk) {
    model.adaptive_capacity = data.adaptive_capacity;
    model.related_adaptive_values = data.related_adaptive_values || [];
    model.adaptive_capacity_description = data.adaptive_capacity_description;
    return model;
  }

  isStepComplete(): boolean {
    return !!this.form.controls.adaptive_capacity.value;
  }
}
