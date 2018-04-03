import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs/Rx';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html'
})
export class HelpModalComponent implements OnInit, OnDestroy {
  public loginSubscription: Subscription;
  public logoutSubscription: Subscription;
  public modalRef: BsModalRef;
  public submitPending = false;
  public user?: User;
  public url: string;
  public userSubscription: Subscription;

  constructor(private modalService: BsModalService,
              public router: Router,
              private authService: AuthService,
              private userService: UserService) {}

  ngOnInit() {
    this.url = document.location.href;

    this.getCurrentUser();
    this.loginSubscription = this.authService.loggedIn.subscribe(() => this.getCurrentUser());
    this.logoutSubscription = this.authService.loggedOut.subscribe(() => this.user = undefined);
    this.userSubscription = this.userService.currentUser.subscribe(user => this.user = user);
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
    this.logoutSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  public isButtonVisible() {
    return this.user &&
           this.router.url !== '/?ref=footer' &&
           this.router.url !== '/' &&
           this.hasSupport();
  }

  public openModal(template: TemplateRef<any>) {
    this.submitPending = false;
    this.modalRef = this.modalService.show(template, {animated: false});
  }

  // Close modal with a timed delay. Form submission requires a delay so that the
  //  form has time to be sent before the modal is closed and the form is destroyed in the DOM
  public closeModal(delay = 0) {
    if (this.modalRef) {
      if (delay > 0) {
        this.submitPending = true;
      }
      window.setTimeout(() => {
        this.modalRef.hide();
        this.modalRef = undefined;
      }, delay);
    }
  }

  private getCurrentUser() {
    if (this.authService.isAuthenticated()) {
      this.userService.current().subscribe(user => this.user = user);
    }
  }

  public hasSupport() {
    if (this.user && this.user.primary_organization) {
      return this.user.primary_organization.hasSupport();
    }

    return false;
  }
}
