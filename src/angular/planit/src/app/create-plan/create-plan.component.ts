import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Organization, User } from '../shared';

import { PlanWizardComponent } from './plan-wizard/plan-wizard.component';

@Component({
  selector: 'app-create-plan',
  templateUrl: 'create-plan.component.html'
})

export class CreatePlanComponent implements OnInit {

  @Output() organization: Organization;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // get organization to edit from current user resolver
    const user: User = this.route.snapshot.data['user'];
    this.organization = user.primary_organization;
  }
}
