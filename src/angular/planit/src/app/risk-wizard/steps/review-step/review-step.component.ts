import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Risk, OrgRiskRelativeOption, OrgRiskRelativeChanceOptions,
    WizardStepComponent } from '../../../shared/';
import { RiskStepKey } from '../../risk-step-key';

import { WizardSessionService } from '../../../core/services/wizard-session.service';

export interface ReviewStepFormModel {
}

@Component({
  selector: 'app-risk-step-review',
  templateUrl: 'review-step.component.html'
})

export class ReviewStepComponent extends WizardStepComponent<Risk, ReviewStepFormModel> implements OnInit {

  public navigationSymbol = '5';
  public title = 'Review';

  public form: FormGroup;
  public risk: Risk;
  public key: RiskStepKey = RiskStepKey.Review;

  constructor(private router: Router,
              protected session: WizardSessionService<Risk>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData();
  }

  getFormModel(): ReviewStepFormModel {
    const data: ReviewStepFormModel = {};
    return data;
  }

  fromModel(model: Risk): ReviewStepFormModel {
    return {
    };
  }

  toModel(data: ReviewStepFormModel, model: Risk) {
    return model;
  }

  setupForm(data: ReviewStepFormModel) {
  }

  finish() {
    this.router.navigate(['assessment']);
  }
}
