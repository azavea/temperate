import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ToastrService } from 'ngx-toastr';

import { Action, Risk } from '../../../shared/';

import { ActionService } from '../../../core/services/action.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

import { ActionStepKey } from '../../action-step-key';
import { ActionWizardStepComponent } from '../../action-wizard-step.component';

interface AssessStepFormModel {
  name: string;
  risk: string;
}

interface NamedRisk {
  name: string;
  risk: Risk;
}

@Component({
  selector: 'app-action-assess-step',
  templateUrl: 'assess-step.component.html'
})
export class AssessStepComponent extends ActionWizardStepComponent<AssessStepFormModel>
                                 implements OnInit {

  public formValid: boolean;
  public key: ActionStepKey = ActionStepKey.Assess;
  public navigationSymbol = '1';
  public title = 'General Information';

  public namedRisks: NamedRisk[];
  private risks: Risk[];

  constructor(protected session: WizardSessionService<Action>,
              protected actionService: ActionService,
              protected toastr: ToastrService,
              private fb: FormBuilder,
              private router: Router,
              private riskService: RiskService) {
    super(session, actionService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    const action = this.session.getData();
    // setup form with action, but no risk, so template will have form controls immediately
    this.setupForm(this.fromModel(action));

    this.riskService.list().subscribe(risks => {
      // the typeahead needs to be fed a pre-formatted name
      this.namedRisks = risks.map(r => {
        return {'risk': r,
                'name': `${r.weather_event.name} on ${r.community_system.name}`};
      });
      this.risks = risks;

      // set risk dropdown value, now that namedRisks populated
      const namedRisk: NamedRisk = this.namedRiskFromId(action.risk);
      this.form.controls['risk'].setValue(namedRisk ? namedRisk.name : '');
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
    const risk = this.matchRisk(this.form.controls.risk.value);
    const data: AssessStepFormModel = {
      name: this.form.controls.name.value,
      risk: risk !== null ? risk.id : null
    };
    return data;
  }

  setupForm(data: AssessStepFormModel) {
    // set risk blank initially, then set to a value after the options have been loaded
    this.form = this.fb.group({
      'name': [data.name ? data.name : '', [Validators.required]],
      'risk': ['', [Validators.required]]
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
    } else {
      this[key] = found;
    }
  }

  matchRisk(riskName: string): Risk {
    const risk = this.namedRisks.find(r =>  riskName === r.name);
    return risk ? risk.risk : null;
  }

  namedRiskFromId(riskId: string): NamedRisk {
    return this.namedRisks.find(r =>  riskId === r.risk.id);
  }
}

