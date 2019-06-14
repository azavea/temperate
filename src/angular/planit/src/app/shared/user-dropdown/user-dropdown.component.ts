import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { OrgSubscriptionOptions, Organization, User } from '../../shared';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html'
})

export class UserDropdownComponent implements OnDestroy, OnInit {
  public user: User;
  public organization: Organization;
  public subscriptionOptions = OrgSubscriptionOptions;
  public userSubscription: Subscription;

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.userSubscription = this.userService.currentUser.subscribe(user => {
      this.user = user;
      this.organization = user.primary_organization;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  public logout() {
    this.authService.logout();
  }
}
