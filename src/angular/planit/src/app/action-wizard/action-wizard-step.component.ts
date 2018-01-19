import { OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Rx';

import { ActionService } from '../core/services/action.service';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Action, WizardStepComponent } from '../shared/';

export abstract class ActionWizardStepComponent<FormModel>
  extends WizardStepComponent<Action, FormModel> implements OnInit {

  constructor(protected fb: FormBuilder,
              protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected toastr: ToastrService) {
    super(session, toastr);
  }

  persistChanges(model: Action): Observable<Action> {
    return !model.id ?
      this.actionService.create(model) :
      this.actionService.update(model);
  }
}
