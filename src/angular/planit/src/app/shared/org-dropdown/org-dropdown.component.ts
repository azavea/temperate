import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Rx';

import { UserService } from '../../core/services/user.service';
import { OrgSubscriptionOptions, Organization, User } from '../../shared';

@Component({
  selector: 'app-org-dropdown',
  templateUrl: './org-dropdown.component.html'
})

export class OrgDropdownComponent implements OnDestroy, OnInit {
  public user: User;
  public primaryOrganization: Organization;
  public organizations: string[];
  public userSubscription: Subscription;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userSubscription = this.userService.currentUser.subscribe(user => {
      this.user = user;
      this.primaryOrganization = user.primary_organization;
      this.organizations = user.organizations;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  private setOrganization(organization: string): void {
    // TODO: change primary organization
    console.log(organization);
  }
}
