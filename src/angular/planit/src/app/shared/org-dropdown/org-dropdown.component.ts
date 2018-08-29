import { Component, OnInit, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Rx';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../../core/services/user.service';
import { OrgSubscriptionOptions, Organization, User } from '../../shared';
import {
  ConfirmationModalComponent
} from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-org-dropdown',
  templateUrl: './org-dropdown.component.html'
})

export class OrgDropdownComponent implements OnInit {
  @ViewChild('confirmOrgChangeModal') confirmOrgChangeModal: ConfirmationModalComponent;

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
    // Show confirmation dialog before switching
    const createNewOrg: boolean = !organization || organization.length === 0;
    var tagline = createNewOrg ? 'Are you sure you want to create a new organization?' :
        `Are you sure you want to switch to organization ${organization}?`;
    tagline += ' Any unsaved changes on the current page will be lost.';

    this.confirmOrgChangeModal.confirm({
      title: createNewOrg ? 'Create new organization' : 'Switch organization',
      tagline: tagline,
      confirmButtonClass: 'button-primary',
      confirmText: createNewOrg ? 'Create' : 'Switch'
    }).onErrorResumeNext().switchMap(() => {
      const newOrg: string = this.organizations ?
        this.organizations.find(org => { return org === organization; }) || '' : '';
      return this.userService.updatePrimaryOrg(this.user, newOrg);
    }).subscribe(() => {
      if (!createNewOrg) {
        this.toastr.success('Changed primary organization');
      }
      this.userService.invalidate();
      window.location.reload();
    }, () => {
      this.toastr.error('Something went wrong, please try again.');
    });
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
