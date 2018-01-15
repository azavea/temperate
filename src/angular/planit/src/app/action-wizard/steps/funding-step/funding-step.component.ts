import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ActionStepKey } from '../../action-step-key';
import { Action, WizardStepComponent } from '../../../shared/';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

interface FundingStepFormModel {
  funding: string;
}

@Component({
  selector: 'app-action-funding-step',
  templateUrl: './funding-step.component.html'
})
export class FundingStepComponent extends WizardStepComponent<Action, FundingStepFormModel>
                                  implements OnInit {
  public form: FormGroup;
  public key = ActionStepKey.Funding;
  public navigationSymbol = '5';
  public title = 'Funding';

  constructor(private fb: FormBuilder,
              protected session: WizardSessionService<Action>) {
    super(session);
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
}
