import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Rx';

import { UserService } from '../../core/services/user.service';
import { Organization, User } from '../../shared';
import {
  ConfirmationModalComponent
} from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-org-dropdown',
  templateUrl: './org-dropdown.component.html'
})

export class OrgDropdownComponent implements OnDestroy, OnInit {
  @ViewChild('confirmOrgChangeModal') confirmOrgChangeModal: ConfirmationModalComponent;

  private dropdownUser: User;
  private dropdownPrimaryOrganization: Organization;
  private dropdownOrganizations: string[];

  private userSubscription: Subscription;

  constructor(private toastr: ToastrService, private userService: UserService) {}

  ngOnInit() {
    // Request current user and subscribe to changes
    this.userService.current().subscribe(user => this.setUser(user));
    this.userSubscription = this.userService.currentUser.subscribe(user => this.setUser(user));
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  get User() {
    return this.dropdownUser;
  }

  get primaryOrganization() {
    return this.dropdownPrimaryOrganization;
  }

  get organizations() {
    return this.dropdownOrganizations;
  }

  private canCreateOrgs(): boolean {
    return this.dropdownUser && this.dropdownUser.can_create_multiple_organizations;
  }

  private setUser(user: User) {
    this.dropdownUser = user;
    this.dropdownPrimaryOrganization = user.primary_organization;
    this.dropdownOrganizations = user.organizations;
  }

  private setOrganization(organization: string): void {
    // Show confirmation dialog before switching
    const createNewOrg: boolean = !organization || organization.length === 0;
    let tagline = createNewOrg ? 'Are you sure you want to create a new organization?' :
        `Are you sure you want to switch to organization ${organization}?`;
    tagline += ' Any unsaved changes on the current page will be lost.';

    this.confirmOrgChangeModal.confirm({
      title: createNewOrg ? 'Create new organization' : 'Switch organization',
      tagline: tagline,
      confirmButtonClass: 'button-primary',
      confirmText: createNewOrg ? 'Create' : 'Switch'
    }).onErrorResumeNext().switchMap(() => {
      const newOrg: string = this.dropdownOrganizations ?
        this.dropdownOrganizations.find(org => org === organization) || '' : '';
      return this.userService.updatePrimaryOrg(this.dropdownUser, newOrg);
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
