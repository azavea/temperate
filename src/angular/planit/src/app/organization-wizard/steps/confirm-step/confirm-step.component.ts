import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { OrganizationService } from '../../../core/services/organization.service';
import { UserService } from '../../../core/services/user.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { Organization } from '../../../shared';
import { OrganizationStepKey } from '../../organization-step-key.enum';
import { OrganizationWizardStepComponent } from '../../organization-wizard-step.component';

@Component({
  selector: 'app-organization-confirm-step',
  templateUrl: './confirm-step.component.html'
})
export class ConfirmStepComponent extends OrganizationWizardStepComponent<any>
                                  implements OnInit {

  public key: OrganizationStepKey = OrganizationStepKey.Confirm;

  @Input() form: FormGroup;

  constructor(protected session: WizardSessionService<Organization>,
              protected organizationService: OrganizationService,
              protected toastr: ToastrService,
              private router: Router) {
    super(session, organizationService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  fromModel(organization: Organization) {
    return {};
  }

  getFormModel() {
    return {};
  }

  toModel(data: any, organization: Organization) {
    return organization;
  }
}
