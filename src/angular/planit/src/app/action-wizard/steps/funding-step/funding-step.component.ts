import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { ActionService } from '../../../core/services/action.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { Action, Risk } from '../../../shared/';
import { ActionStepKey } from '../../action-step-key';
import { ActionWizardStepComponent } from '../../action-wizard-step.component';

interface FundingStepFormModel {
  funding: string;
}

@Component({
  selector: 'app-action-funding-step',
  templateUrl: './funding-step.component.html'
})
export class FundingStepComponent extends ActionWizardStepComponent<FundingStepFormModel>
                                  implements OnInit {

 @Input() risk: Risk;

  public form: FormGroup;
  public key = ActionStepKey.Funding;
  public navigationSymbol = '5';
  public title = 'Funding';

  constructor(protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected toastr: ToastrService,
              protected fb: FormBuilder,
              private router: Router) {
    super(session, actionService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    const action = this.session.getData();
    this.setupForm(this.fromModel(action));
  }

  getFormModel(): FundingStepFormModel {
    const data: FundingStepFormModel = {
      funding: this.form.controls.funding.value
    };
    return data;
  }

  setupForm(data: FundingStepFormModel) {
    this.form = this.fb.group({
      'funding': [data.funding, []]
    });
  }

  fromModel(model: Action): FundingStepFormModel {
    return {
      funding: model.funding
    };
  }

  toModel(data: FundingStepFormModel, model: Action) {
    model.funding = data.funding;
    return model;
  }

  finish() {
    this.save();
    this.router.navigate(['actions'],
      {'queryParams': {'hazard': this.risk.weather_event.id}});
  }

  isStepComplete() {
    return !!this.form.controls.funding.value;
  }
}
