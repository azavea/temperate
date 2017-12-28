import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { OrgRiskRelativeOption,
         OrgRiskRelativeImpactOptions,
         Risk,
         WizardStepComponent } from '../../../shared/';
import { RiskStepKey } from '../../risk-step-key';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

export interface ImpactStepFormModel {
  impactMagnitude: OrgRiskRelativeOption;
  impactDescription?: string;
}

@Component({
  selector: 'app-risk-step-impact',
  templateUrl: 'impact-step.component.html'
})

export class ImpactStepComponent extends WizardStepComponent<Risk> implements OnInit {

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

  save() {
    const data: ImpactStepFormModel = {
      impactMagnitude: this.form.controls.impactMagnitude.value,
      impactDescription: this.form.controls.impactDescription.value
    };
    this.session.setDataForKey(this.key, data);
  }

  setupForm(data: ImpactStepFormModel) {
    this.form = this.fb.group({
      'impactMagnitude': [data.impactMagnitude, []],
      'impactDescription': [data.impactDescription, []]
    });
  }

  fromModel(model: Risk): ImpactStepFormModel {
    return {
      impactMagnitude: model.impactMagnitude,
      impactDescription: model.impactDescription
    };
  }

  toModel(data: ImpactStepFormModel, model: Risk) {
    model.impactMagnitude = data.impactMagnitude;
    model.impactDescription = data.impactDescription;
    return model;
  }
}