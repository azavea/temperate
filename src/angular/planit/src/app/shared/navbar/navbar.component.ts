import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs/Rx';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  public modalRef: BsModalRef;
  public isFreeTrial: boolean;
  public loginSubscription: Subscription;
  public logoutSubscription: Subscription;
  public trialDaysRemaining: number;
  public user?: User;
  public userSubscription: Subscription;

  constructor(public authService: AuthService,
              private modalService: BsModalService,
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

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {animated: false});
  }

  private showLink(link: string): boolean {
    const url = this.router.url;
    return link !== url && '/create-organization' !== url && '/plan' !== url;
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
}
