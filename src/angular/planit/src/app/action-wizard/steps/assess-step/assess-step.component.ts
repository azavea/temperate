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

  public risks: any[];
  private riskList: Risk[];
  private risk: Risk;
  private name: string;

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
      this.risks = risks.map(r => {
        return {'id': r.id,
                'name': `${r.weatherEvent.name} on ${r.communitySystem.name}`};
      });
      this.riskList = risks;
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
      name: this.name,
      risk: this.risk
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

  toModel(data: AssessStepFormModel, action: Action) {
    action.name = data.name;
    action.risk = data.risk;
    return action;
  }

  itemSelected(key: string, event: TypeaheadMatch | null) {
    const savedName = this[key] ? this[key].name : null;
    const formName = this.form.controls[key].value;
    if (event !== null || savedName !== formName) {
      this[key] = event && event.item ? event.item : null;
    }
  }

  itemBlurred(key: string) {
  //   // Manually set form error if user exits field without selecting
  //   // a valid autocomplete option.
  //   const options = key === 'risk' ? this.risk: this.risks;

  //   // The order in which itemSelected and itemBlurred fire is unpredictable,
  //   // so wait to give itemSelected a chance to update the form value.
  //   setTimeout(() => {
  //     const val = this.form.controls[key].value;
  //     // const found = options.find(option => option.name === val);
  //     // if (!found) {
  //     //   this.form.controls[key].setErrors({'autocomplete': true});
  //     // }
  //   }, 500);
  }
}

