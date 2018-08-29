import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs/Rx';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  public isFreeTrial: boolean;
  public loginSubscription: Subscription;
  public logoutSubscription: Subscription;
  public trialDaysRemaining: number;
  public user?: User;
  public userSubscription: Subscription;

  constructor(public authService: AuthService,
              public router: Router,
              private userService: UserService) {}

  public ngOnInit() {
    // Explicitly make request for current user so we know that the component has initialized
    // Without this we rely on one of the below observables to fire, which is not guaranteed
    this.getCurrentUser();
    this.loginSubscription = this.authService.loggedIn.subscribe(() => this.getCurrentUser());
    this.logoutSubscription = this.authService.loggedOut.subscribe(() => this.setUser(undefined));
    this.userSubscription = this.userService.currentUser.subscribe(user => this.setUser(user));
  }

  public ngOnDestroy() {
    this.loginSubscription.unsubscribe();
    this.logoutSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  private showOrgDropdown(): boolean {
    // Any user in multiple organizations or with the ability to create multiple organizations
    // can see the org dropdown.
    return this.user && (this.user.can_create_multiple_organizations ||
                         this.user.organizations.length > 1);
  }

  private showLink(): boolean {
    if (this.user && this.user.primary_organization) {
      if (this.user.primary_organization.plan_setup_complete) {
        return true;
      }
    }

    return false;
  }

  private getCurrentUser() {
    if (this.authService.isAuthenticated()) {
      this.userService.current().subscribe(user => this.setUser(user));
    }
  }

  private setUser(user?: User) {
    this.user = user;
    // Cache interesting items as component properties so change detection picks them up
    //  when user is changed
    if (this.user && this.user.primary_organization) {
      this.isFreeTrial = this.user.primary_organization.isFreeTrial();
      this.trialDaysRemaining = this.user.primary_organization.trialDaysRemaining();
    } else {
      this.isFreeTrial = false;
    }
  }

  public isManageSubscriptionPage() {
    return this.router.url === '/subscription';
  }
}
