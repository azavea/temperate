import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';

import { OrganizationService } from '../../../../core/services/organization.service';
import { WizardSessionService } from '../../../../core/services/wizard-session.service';
import {
  City,
  Organization,
  WizardStepComponent
} from '../../../../shared/';

import { PlanStepKey } from '../../plan-step-key';
import { PlanWizardStepComponent } from '../../plan-wizard-step.component';

interface DueDateStepFormModel {
  city_name: string;
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
  public title = 'Expected finish date';

  public cityName: string;
  public minDate: Date = new Date();
  public planDueDate: Date;
  public suggestedDate: Date;

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
    this.planDueDate = org.plan_due_date;
    this.setupForm(this.fromModel(org));
  }

  fromModel(org: Organization): DueDateStepFormModel {
    return {
      city_name: org.location.properties.name,
      plan_due_date: org.plan_due_date
    };
  }

  getFormModel(): DueDateStepFormModel {
    const data: DueDateStepFormModel = {
      city_name: this.cityName,
      plan_due_date: this.planDueDate
    };
    return data;
  }

  setupForm(data: DueDateStepFormModel) {
    this.form = this.fb.group({
      'city_name': [{value: data.city_name ? data.city_name : '', disabled: true},
                   [Validators.required]],
      'plan_due_date': [data.plan_due_date ? data.plan_due_date : '',
                       [Validators.required]]
    });
  }

  toModel(data: DueDateStepFormModel, org: Organization) {
    // city name is read-only
    org.plan_due_date = data.plan_due_date;
    return org;
  }
}
