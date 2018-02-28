import { Component, OnInit } from '@angular/core';

import { UserService } from '../core/services/user.service';
import { OrgSubscription, OrgSubscriptionOptions, OrgSubscriptionPlan, User } from '../shared';

@Component({
  selector: 'app-manage-subscription',
  templateUrl: 'manage-subscription.component.html'
})
export class ManageSubscriptionComponent implements OnInit {

  public customPlan = OrgSubscriptionOptions.get(OrgSubscription.Custom);
  public hourlyPlan = OrgSubscriptionOptions.get(OrgSubscription.Hourly);
  public user: User;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.current().subscribe(user => this.user = user);
  }

  public planSelected(plan: OrgSubscriptionPlan) {
    this.user.primary_organization = Object.assign(this.user.primary_organization, {
      subscription: plan.name
    });
    console.log('You selected:', plan);
  }
}
