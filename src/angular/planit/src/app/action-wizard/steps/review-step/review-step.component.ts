import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Rx';

import { ActionService } from '../../../core/services/action.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import {
  Action,
  OrgRiskDirectionalFrequencyOptions,
  OrgRiskDirectionalIntensityOptions,
  OrgRiskRelativeChanceOptions,
  OrgRiskRelativeImpactOptions,
  Risk
} from '../../../shared';
import { ActionVisibility } from '../../../shared/models/action.model';
import { ActionWizardStepComponent } from '../../action-wizard-step.component';

import { ActionStepKey } from '../../action-step-key';

@Component({
  selector: 'app-action-review-step',
  templateUrl: './review-step.component.html'
})
export class ReviewStepComponent extends ActionWizardStepComponent<any>
                                 implements OnInit, OnDestroy {

  public form: FormGroup;
  public key: ActionStepKey = ActionStepKey.Review;
  public navigationSymbol = '6';
  public title = 'Review';

  public action: Action;
  public risk: Risk;

  public frequencyOptions = OrgRiskDirectionalFrequencyOptions;
  public intensityOptions = OrgRiskDirectionalIntensityOptions;
  public chanceOptions = OrgRiskRelativeChanceOptions;
  public impactOptions = OrgRiskRelativeImpactOptions;
  public visibilityOptions = ActionVisibility;

  private sessionSubscription: Subscription;

  constructor(protected actionService: ActionService,
              protected riskService: RiskService,
              protected router: Router,
              protected session: WizardSessionService<Action>,
              protected toastr: ToastrService) {
    super(session, actionService, riskService, toastr, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.action = this.session.getData();

    this.riskService.get(this.action.risk).subscribe(r => this.risk = r);

    this.sessionSubscription = this.session.data.subscribe(a => {
      this.action = a;
    });
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
  }

  finish() {
    this.router.navigate(['actions'], {'queryParams': {'hazard': this.risk.weather_event.id}});
  }

  getFormModel() {
    return {};
  }

  fromModel(model: Action) {
    return {};
  }

  toModel(data: any, model: Action) {
    return model;
  }

  setupForm(data: any) {}
}
