import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

import { Action,
         Risk,
         WizardStepComponent } from '../../../shared/';

import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { RiskService } from '../../../core/services/risk.service';

import { ActionStepKey } from '../../action-step-key';

interface AssessStepFormModel {
  name: string;
  risk: Risk;
}

@Component({
  selector: 'app-action-assess-step',
  templateUrl: 'assess-step.component.html'
})
export class AssessStepComponent extends WizardStepComponent<Action, AssessStepFormModel>
                                 implements OnInit {

  public form: FormGroup;
  public formValid: boolean;
  public key: ActionStepKey = ActionStepKey.Assess;
  public navigationSymbol = '1';
  public title = 'General Information';

  public namedRisks: AssessStepFormModel[];
  private risks: Risk[];

  constructor(private fb: FormBuilder,
              private router: Router,
              private riskService: RiskService,
              protected session: WizardSessionService<Action>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    const action = this.session.getData();
    this.setupForm(this.fromModel(action));

    this.riskService.list().subscribe(risks => {
      // the typeahead needs to be fed a pre-formatted name
      this.namedRisks = risks.map(r => {
        return {'risk': r,
                'name': `${r.weatherEvent.name} on ${r.communitySystem.name}`};
      });
      this.risks = risks;
    });
}

  cancel () {
    this.router.navigate(['actions']);
  }

  fromModel(action: Action): AssessStepFormModel {
    return {
       name: action.name,
       risk: action.risk
    };
  }

  getFormModel(): AssessStepFormModel {
    const data: AssessStepFormModel = {
      name: this.form.controls.name.value,
      risk: this.matchRisk(this.form.controls.risk.value)
    };
    return data;
  }

  setupForm(data: AssessStepFormModel) {
    this.form = this.fb.group({
      'name': [data.name ? data.name : '',
                [Validators.required]],
      'risk': [data.risk ? data.risk : '',
                [Validators.required]]
    });
  }

  toModel(data: AssessStepFormModel, model: Action) {
    model.name = data.name;
    model.risk = data.risk;
    return model;
  }

  itemBlurred(key: string) {
    // Manually set form error if user exits field without selecting
    // a valid autocomplete option.
    const val = this.form.controls[key].value;
    const found = this.matchRisk(val);
    if (found === null) {
      this.form.controls[key].setErrors({'autocomplete': true});
    }
  }

  matchRisk(riskName: string): Risk {
    const risk = this.namedRisks.find(r =>  riskName === r.name);
    return risk ? risk.risk : null;
  }
}

