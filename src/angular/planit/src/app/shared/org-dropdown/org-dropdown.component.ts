import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Rx';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private toastr: ToastrService, private userService: UserService) {}

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
    const newOrg: string = this.organizations.find(org => { return org === organization; });
    if (newOrg) {
      this.user.primary_organization.name = newOrg;
      this.save(this.userService.update(this.user), 'Changed primary organization');
    }
  }

  private save(observable, success) {
    observable.subscribe(() => {
      this.toastr.success(success);
    }, () => {
      this.toastr.error('Something went wrong, please try again.');
    });
  }
}
