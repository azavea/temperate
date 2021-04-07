import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

import { PreviousRouteGuard } from '../core/services/previous-route-guard.service';
import { RiskService } from '../core/services/risk.service';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Risk, WizardStepComponent } from '../shared/';

export abstract class RiskWizardStepComponent<FormModel>
  extends WizardStepComponent<Risk, FormModel>
  implements OnInit {
  public isDisabled = false;

  constructor(
    protected session: WizardSessionService<Risk>,
    protected riskService: RiskService,
    protected toastr: ToastrService,
    protected router: Router,
    protected previousRouteGuard: PreviousRouteGuard
  ) {
    super(session, toastr);
  }

  shouldSave() {
    return !this.isDisabled;
  }

  setDisabled(risk: Risk) {
    const hasWeatherEvent = !!risk.weather_event && !!risk.weather_event.id;
    const hasCommunitySystem = !!risk.community_system && !!risk.community_system.id;
    this.isDisabled = !hasWeatherEvent || !hasCommunitySystem;
    if (this.form) {
      if (this.isDisabled) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
  }

  finish() {
    this.save().then(() => {
      const risk = this.session.getData();
      if (risk && risk.weather_event) {
        this.router.navigate(['assessment'], { queryParams: { hazard: risk.weather_event.id } });
      } else {
        this.cancel();
      }
    });
  }

  cancel() {
    this.router.navigate([this.previousRouteGuard.previousUrl], {
      queryParams: this.previousRouteGuard.previousQueryParams,
    });
  }

  persistChanges(model: Risk): Observable<Risk> {
    const is_modified = model.is_modified || model.isRiskPartiallyAssessed();
    const risk = new Risk({ ...model, is_modified });
    return !risk.id ? this.riskService.create(risk) : this.riskService.update(risk);
  }
}
