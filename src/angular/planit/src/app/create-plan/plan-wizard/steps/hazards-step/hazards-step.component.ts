import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import {
  Organization,
  Risk
} from '../../../../shared/';

import { OrganizationService } from '../../../../core/services/organization.service';
import { WizardSessionService } from '../../../../core/services/wizard-session.service';
import { PlanStepKey } from '../../plan-step-key';
import { PlanWizardStepComponent } from '../../plan-wizard-step.component';

@Component({
  selector: 'app-plan-step-hazards',
  templateUrl: 'hazards-step.component.html'
})

export class HazardsStepComponent extends PlanWizardStepComponent<Organization>
                                  implements OnInit {

  public form: FormGroup;
  public key = PlanStepKey.Hazards;
  public navigationSymbol = '2';
  public organization: Organization;
  public title = 'Hazards';

  private hazards: Risk[];

  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected toastr: ToastrService,
              private fb: FormBuilder) {
    super(session, orgService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    this.organization = this.session.getData();
    this.setupForm(this.fromModel(this.organization));
  }

  getFormModel(): Organization {
    return this.organization;
  }

  setupForm(data: Organization) {
    this.form = this.fb.group({});
  }

  fromModel(model: Organization): Organization {
    // TODO: hazards are not stored on Organization; get them here somehow
    return null;
  }

  toModel(data: Organization, model: Organization): Organization {
    // TODO: set hazards somewhere
    return model;
  }

  isStepComplete(): boolean {
    return true; // TODO: implement or remove
  }
}
