import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Rx';

import { RiskService } from '../core/services/risk.service';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Risk, WizardStepComponent } from '../shared/';

export abstract class RiskWizardStepComponent<FormModel>
  extends WizardStepComponent<Risk, FormModel> implements OnInit {

  public isDisabled = false;

  constructor(protected session: WizardSessionService<Risk>,
              protected riskService: RiskService,
              protected toastr: ToastrService,
              protected router: Router) {
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
    // ng2-archwizard save() takes a direction, like forward or back,
    // but we're not going in any direction when exiting
    this.save(undefined).then(() => {
      const risk = this.session.getData();
      this.router.navigate(['assessment'],
        {'queryParams': {'hazard': risk.weather_event.id}});
    });
  }

  persistChanges(model: Risk): Observable<Risk> {
    return !model.id ?
      this.riskService.create(model) :
      this.riskService.update(model);
  }
}
