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

  finish() {
    // ng2-archwizard save() takes a direction, like forward or back,
    // but we're not going in any direction when exiting
    this.save(undefined).then(() => {
      this.action = this.session.getData();
      this.cancel();
    });
  }

  cancel() {
    if (this.action.risk) {
      this.riskService.get(this.action.risk).subscribe(r => {
        this.router.navigate(['actions'],
          {'queryParams': {'hazard': r.weather_event.id}});
      });
    } else {
      this.router.navigate(['/actions']);
    }
  }
}
