import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { OrganizationService } from '../../../../core/services/organization.service';
import { WizardSessionService } from '../../../../core/services/wizard-session.service';
import {
  Organization,
  WizardStepComponent
} from '../../../../shared/';

import { PlanStepKey } from '../../plan-step-key';
import { PlanWizardStepComponent } from '../../plan-wizard-step.component';

interface DueDateStepFormModel {
  plan_due_date: Date;
}

@Component({
  selector: 'app-plan-step-due-date',
  templateUrl: 'due-date-step.component.html'
})
export class DueDateStepComponent extends PlanWizardStepComponent<DueDateStepFormModel>
                                   implements OnInit {

  public formValid: boolean;
  public key: PlanStepKey = PlanStepKey.DueDate;
  public navigationSymbol = '1';
  public title = 'Identify risk';

  private plan_due_date: Date;


  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected toastr: ToastrService,
              protected fb: FormBuilder,
              private router: Router) {
    super(session, orgService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    const org = this.session.getData();
    this.setupForm(this.fromModel(org));
    this.plan_due_date = org.plan_due_date || null;
  }

  cancel() {
    // TODO:
    console.error('TODO: implement cancel');
    //this.router.navigate(['assessment']);
  }

  fromModel(org: Organization): DueDateStepFormModel {
    return {
      plan_due_date: org.plan_due_date
    };
  }

  getFormModel(): DueDateStepFormModel {
    const data: DueDateStepFormModel = {
      plan_due_date: this.plan_due_date
    };
    return data;
  }

  setupForm(data: DueDateStepFormModel) {
    this.form = this.fb.group({
      // TODO: validate in future?
      'plan_due_date': [data.plan_due_date ? data.plan_due_date : '',
                       [Validators.required]]
    });
  }

  toModel(data: DueDateStepFormModel, org: Organization) {
    org.plan_due_date = data.plan_due_date;
    return org;
  }
}
