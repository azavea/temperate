import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Rx';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../../core/services/user.service';
import { OrgSubscriptionOptions, Organization, User } from '../../shared';

@Component({
  selector: 'app-org-dropdown',
  templateUrl: './org-dropdown.component.html'
})

export class OrgDropdownComponent implements OnInit {
  public user: User;
  public primaryOrganization: Organization;
  public organizations: string[];

  constructor(private toastr: ToastrService, private userService: UserService) {}

  ngOnInit() {
    // Request current user, but do not subscribe to changes, since page reloads on org change.
    this.userService.current().subscribe(user => {
      this.user = user;
      this.primaryOrganization = user.primary_organization;
      this.organizations = user.organizations;
    });
  }

  private canCreateOrgs(): boolean {
    return this.user && this.user.can_create_multiple_organizations;
  }

  private setOrganization(organization: string): void {
    const newOrg: string = this.organizations ?
      this.organizations.find(org => { return org === organization; }) || '' : '';
    this.save(this.userService.updatePrimaryOrg(this.user, newOrg),
              'Changed primary organization');
  }

  private save(observable, success) {
    observable.subscribe(() => {
      this.toastr.success(success);
      this.userService.invalidate();
      window.location.reload();
    }, () => {
      this.toastr.error('Something went wrong, please try again.');
    });
  }
}
