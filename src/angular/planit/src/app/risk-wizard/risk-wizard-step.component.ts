import { OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Rx';

import { RiskService } from '../core/services/risk.service';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Risk, WizardStepComponent } from '../shared/';

export abstract class RiskWizardStepComponent<FormModel>
  extends WizardStepComponent<Risk, FormModel> implements OnInit {

  constructor(protected fb: FormBuilder,
              protected session: WizardSessionService<Risk>,
              protected riskService: RiskService,
              protected toastr: ToastrService) {
    super(session, toastr);
  }

  persistChanges(model: Risk): Observable<Risk> {
    return !model.id ?
      this.riskService.create(model) :
      this.riskService.update(model);
  }
}
