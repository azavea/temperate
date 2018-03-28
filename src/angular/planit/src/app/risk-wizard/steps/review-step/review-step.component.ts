import { AfterViewChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Subscription';

import { PreviousRouteGuard } from '../../../core/services/previous-route-guard.service';
import { Risk } from '../../../shared/';
import { RiskStepKey } from '../../risk-step-key';
import { RiskWizardStepComponent } from '../../risk-wizard-step.component';

import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

@Component({
  selector: 'app-risk-step-review',
  templateUrl: 'review-step.component.html'
})

export class ReviewStepComponent extends RiskWizardStepComponent<any>
                                 implements OnDestroy, OnInit {

  public navigationSymbol = '5';
  public title = 'Review';

  public risk: Risk;
  public key: RiskStepKey = RiskStepKey.Review;

  private sessionSubscription: Subscription;

  constructor(protected session: WizardSessionService<Risk>,
              protected riskService: RiskService,
              protected toastr: ToastrService,
              protected fb: FormBuilder,
              protected router: Router,
              protected previousRouteGuard: PreviousRouteGuard) {
    super(session, riskService, toastr, router, previousRouteGuard);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData();
    this.setDisabled(this.risk);
    this.sessionSubscription = this.session.data.subscribe(risk => {
      this.risk = risk;
      this.setDisabled(this.risk);
    });
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
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
}
