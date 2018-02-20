import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { Action, Risk } from '../../../shared/';

import { ActionService } from '../../../core/services/action.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

import { ActionStepKey } from '../../action-step-key';
import { ActionWizardStepComponent } from '../../action-wizard-step.component';

interface AssessStepFormModel {
  name: string;
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

  public namedRisk: NamedRisk;

  private action: Action;

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
    this.action = this.session.getData();
    this.setupForm(this.fromModel(this.action));

    this.riskService.get(this.action.risk).subscribe(risk => {
      this.namedRisk = {
        'risk': risk,
        'name': `${risk.weather_event.name} on ${risk.community_system.name}`};
    });
  }

  // if have unsaved changes, save before redirecting to parent view
  cancel() {
    if (this.shouldSave()) {
      this.save(this.action).then(result => { this.exit(); });
    } else {
      this.exit();
    }
  }

  exit() {
    this.router.navigate(['actions'],
      {'queryParams': {'hazard': this.namedRisk.risk.weather_event.id}});
  }

  fromModel(action: Action): AssessStepFormModel {
    return {
       name: action.name
    };
  }

  getFormModel(): AssessStepFormModel {
    const data: AssessStepFormModel = {
      name: this.form.controls.name.value,
    };
    return data;
  }

  // return false if user is creating a new action and has nothing typed in
  shouldSave(): boolean {
    return this.action.id ? true : this.form.valid && !this.form.pristine;
  }

  setupForm(data: AssessStepFormModel) {
    this.form = this.fb.group({
      'name': [data.name ? data.name : '', [Validators.required]]
    });
  }

  toModel(data: AssessStepFormModel, model: Action): Action {
    model.name = data.name;

    return model;
  }

  isStepComplete(): boolean {
    return this.form.controls.name.valid;
  }
}
