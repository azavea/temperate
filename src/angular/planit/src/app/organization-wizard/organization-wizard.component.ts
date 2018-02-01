import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
//
// Import from root doesn't seem to pickup types, so import directly from file
import { WizardComponent } from 'ng2-archwizard/dist/components/wizard.component';

import { WizardSessionService } from '../core/services/wizard-session.service';
import { Organization } from '../shared/';

import { CityStepComponent } from './steps/city-step/city-step.component';
import { ConfirmStepComponent } from './steps/confirm-step/confirm-step.component';
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
  @ViewChild(ConfirmStepComponent) public confirmStep: ConfirmStepComponent;

  public form: FormGroup;

  constructor(private session: WizardSessionService<Organization>,
              private fb: FormBuilder) {}

  ngOnInit() {
    this.session.setData(new Organization({}));
    this.form = this.fb.group({
      'location': ['', [Validators.required]],
      'name': ['', [Validators.required]]
    });
  }

}
