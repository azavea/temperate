import { OnInit } from '@angular/core';

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
              protected toastr: ToastrService) {
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

  persistChanges(model: Risk): Observable<Risk> {
    return !model.id ?
      this.riskService.create(model) :
      this.riskService.update(model);
  }
}
