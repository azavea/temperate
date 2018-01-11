import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Risk,
         OrgRiskDirectionalOptions,
         OrgRiskRelativeChanceOptions,
         OrgRiskRelativeImpactOptions,
         WizardStepComponent } from '../../../shared/';
import { RiskStepKey } from '../../risk-step-key';

import { WizardSessionService } from '../../../core/services/wizard-session.service';

@Component({
  selector: 'app-risk-step-review',
  templateUrl: 'review-step.component.html'
})

export class ReviewStepComponent extends WizardStepComponent<Risk, any> implements OnInit {

  public navigationSymbol = '5';
  public title = 'Review';

  public form: FormGroup;
  public risk: Risk;
  public key: RiskStepKey = RiskStepKey.Review;

  public directionalOptions = OrgRiskDirectionalOptions;
  public chanceOptions = OrgRiskRelativeChanceOptions;
  public impactOptions = OrgRiskRelativeImpactOptions;

  constructor(private router: Router,
              protected session: WizardSessionService<Risk>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData();
  }

  getFormModel() {
    const data = {};
    return data;
  }

  fromModel(model: Risk) {
    return {
    };
  }

  toModel(data: any, model: Risk) {
    return model;
  }

  setupForm(data: any) {
  }

  finish() {
    this.router.navigate(['assessment']);
  }
}
