import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
//
// Import from root doesn't seem to pickup types, so import directly from file
import { WizardComponent } from 'ng2-archwizard/dist/components/wizard.component';

import { UserService } from '../core/services/user.service';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Organization, User } from '../shared/';

import { CityStepComponent } from './steps/city-step/city-step.component';
import { InviteStepComponent } from './steps/invite-step/invite-step.component';

@Component({
  selector: 'app-organization-wizard',
  templateUrl: './organization-wizard.component.html',
  providers: [WizardSessionService]
})
export class OrganizationWizardComponent implements OnInit {

  @ViewChild(WizardComponent) public wizard: WizardComponent;
  @ViewChild(CityStepComponent) public identifyStep: CityStepComponent;
  @ViewChild(InviteStepComponent) public inviteStep: InviteStepComponent;

  public form: FormGroup;
  public user: User;

  constructor(private session: WizardSessionService<Organization>,
              private userService: UserService,
              private fb: FormBuilder) {}

  ngOnInit() {
    this.session.setData(new Organization({}));
    this.form = this.fb.group({
      'location': ['', [Validators.required]],
      'name': ['', [Validators.required]],
      'invites': [new Set(), []]
    });
    this.userService.current().subscribe(user => this.user = user);
  }

}
