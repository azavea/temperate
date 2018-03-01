import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

// Import from root doesn't seem to pickup types, so import directly from file
import { WizardComponent } from 'ng2-archwizard/dist/components/wizard.component';

import { OrganizationService } from '../../core/services/organization.service';
import { WizardSessionService } from '../../core/services/wizard-session.service';
import { Organization } from '../../shared/';
// tslint:disable-next-line:max-line-length
import { CommunitySystemsStepComponent } from './steps/community-systems-step/community-systems-step.component';
import { DueDateStepComponent } from './steps/due-date-step/due-date-step.component';
import { HazardsStepComponent } from './steps/hazards-step/hazards-step.component';


@Component({
  selector: 'app-plan-wizard',
  templateUrl: 'plan-wizard.component.html',
  providers: [WizardSessionService]
})
export class PlanWizardComponent implements OnInit {
  // this.wizard.navigation and this.wizard.model are not available until after AfterViewInit

  @ViewChild(WizardComponent) public wizard: WizardComponent;
  @ViewChild(CommunitySystemsStepComponent) public communitySystemsStep:
                                                   CommunitySystemsStepComponent;
  @ViewChild(DueDateStepComponent) public dueDateStep: DueDateStepComponent;
  @ViewChild(HazardsStepComponent) public hazardsStep: HazardsStepComponent;

  @Input() organization: Organization;

  public wizardComplete = false;

  constructor(private session: WizardSessionService<Organization>,
              private organizationService: OrganizationService,
              private router: Router) {}

  ngOnInit() {
    // will edit primary organization for current user
    this.session.setData(this.organization);
  }

  // when done, show spinner for a few seconds before redirecting to home page
  onWizardCompleted() {
    this.wizardComplete = true;
    this.organization.plan_setup_complete = true;
    this.organizationService.update(this.organization).subscribe(() => {
      const self = this;
      setTimeout(function () {
        self.router.navigate(['dashboard']);
      }, 5000);
    });
  }

  public resetScroll() {
    window.scrollTo(0, 0);
  }
}
