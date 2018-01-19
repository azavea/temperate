import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { WizardSessionService } from '../../../core/services/wizard-session.service';
import {
  OrgRiskRelativeImpactOptions,
  OrgRiskRelativeOption,
  Risk,
  WizardStepComponent
} from '../../../shared/';
import { RiskStepKey } from '../../risk-step-key';

export interface ImpactStepFormModel {
  impact_magnitude: OrgRiskRelativeOption;
  impact_description?: string;
}

@Component({
  selector: 'app-risk-step-impact',
  templateUrl: 'impact-step.component.html'
})

export class ImpactStepComponent extends WizardStepComponent<Risk, ImpactStepFormModel>
                                 implements OnInit {

  public form: FormGroup;
  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Impact;
  public navigationSymbol = '3';
  public risk: Risk;
  public title = 'Impact';

  public relativeOptions = OrgRiskRelativeImpactOptions;
  // Can't *ngFor a map type or iterable, so instead we realize the iterable and use that in *ngFors
  public relativeOptionsKeys = Array.from(OrgRiskRelativeImpactOptions.keys());


  constructor(private fb: FormBuilder,
              protected session: WizardSessionService<Risk>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData() || new Risk({});
    this.setupForm(this.fromModel(this.risk));
  }

  getFormModel(): ImpactStepFormModel {
    const data: ImpactStepFormModel = {
      impact_magnitude: this.form.controls.impact_magnitude.value,
      impact_description: this.form.controls.impact_description.value
    };
    return data;
  }

  setupForm(data: ImpactStepFormModel) {
    this.form = this.fb.group({
      'impact_magnitude': [data.impact_magnitude, []],
      'impact_description': [data.impact_description, []]
    });
  }

  fromModel(model: Risk): ImpactStepFormModel {
    return {
      impact_magnitude: model.impact_magnitude,
      impact_description: model.impact_description
    };
  }

  toModel(data: ImpactStepFormModel, model: Risk) {
    model.impact_magnitude = data.impact_magnitude;
    model.impact_description = data.impact_description;
    return model;
  }

  isStepComplete(): boolean {
    return !!this.form.controls.impact_magnitude.value;
  }
}
