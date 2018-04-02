import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Rx';

import { ActionService } from '../core/services/action.service';
import { RiskService } from '../core/services/risk.service';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Action, WizardStepComponent } from '../shared/';

export abstract class ActionWizardStepComponent<FormModel>
  extends WizardStepComponent<Action, FormModel> implements OnInit {

  public isDisabled = false;

  constructor(protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected riskService: RiskService,
              protected toastr: ToastrService,
              protected router: Router) {
    super(session, toastr);
  }

  public action: Action;

  persistChanges(model: Action): Observable<Action> {
    return !model.id ?
      this.actionService.create(model) :
      this.actionService.update(model);
  }

  setDisabled(action: Action) {
    this.isDisabled = (action.name === '');

    if (this.form) {
      if (this.isDisabled) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
  }

  shouldSave() {
    return !this.isDisabled;
  }

  finish() {
    this.save().then(() => {
      this.action = this.session.getData();
      this.cancel(true);
    });
  }

  cancel(fromFinish?: boolean) {
    if (this.action.risk) {
      this.riskService.get(this.action.risk).subscribe(r => {
        const queryParams = {'queryParams': {'hazard': r.weather_event.id}};

        if (fromFinish) {
          queryParams['queryParams']['fromWizard'] = true;
        }

        this.router.navigate(['actions'], queryParams);
      });
    } else {
      this.router.navigate(['/actions']);
    }
  }
}
