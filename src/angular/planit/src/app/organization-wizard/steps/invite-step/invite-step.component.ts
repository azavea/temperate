import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { WizardComponent } from 'ng2-archwizard';
import { ToastrService } from 'ngx-toastr';

import { OrganizationService } from '../../../core/services/organization.service';
import { UserService } from '../../../core/services/user.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { Organization } from '../../../shared';
import { OrganizationStepKey } from '../../organization-step-key.enum';
import { OrganizationWizardStepComponent } from '../../organization-wizard-step.component';

interface InviteStepFormModel {
  invites: string[];
}

@Component({
  selector: 'app-organization-invite-step',
  templateUrl: './invite-step.component.html'
})
export class InviteStepComponent extends OrganizationWizardStepComponent<InviteStepFormModel>
                                 implements OnInit {

  public key: OrganizationStepKey = OrganizationStepKey.Invite;
  public inviteErrors: { [key: string]: string} = {};

  @Input() form: FormGroup;
  @Input() wizard: WizardComponent;

  constructor(protected session: WizardSessionService<Organization>,
              protected organizationService: OrganizationService,
              protected userService: UserService,
              protected toastr: ToastrService,
              private router: Router) {
    super(session, organizationService, toastr);
  }

  fromModel(organization: Organization): InviteStepFormModel {
    return {invites: organization.invites || []};
  }

  getFormModel(): InviteStepFormModel {
    const data: InviteStepFormModel = {
      invites: this.form.controls.invites.value
    };
    return data;
  }

  toModel(data: InviteStepFormModel, organization: Organization) {
    organization.invites = data.invites;
    return organization;
  }

  shouldSkip() {
    return this.form.controls.invites.value.length === 0;
  }

  confirm() {
    this.save().then((success) => {
      if (success) {
        // get updated user with new organization on next user query
        this.userService.invalidate();
        this.router.navigate(['/plan']);
      } else {
        const controls = this.form.controls;
        if (controls.location.invalid || controls.name.invalid) {
          this.wizard.navigation.goToStep(0);
        }
        if (controls.invites.invalid) {
          this.inviteErrors = controls.invites.errors.server;
          controls.invites.setErrors({server:
            'A user already exists for one or more of the above email addresses.'
          });
        }
      }
    });
  }
}
