import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
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
export class NavbarComponent implements OnInit {

  public modalRef: BsModalRef;
  public isFreeTrial: boolean;
  public trialDaysRemaining: number;
  public user: User;

  constructor(public authService: AuthService,
              private modalService: BsModalService,
              public router: Router,
              private userService: UserService) {}

  public ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.userService.current().subscribe(user => this.setUser(user));
    }
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {animated: false});
  }

  private showLink(link: string): boolean {
    const url = this.router.url;
    return link !== url && '/create-organization' !== url && '/plan' !== url;
  }

  private setUser(user: User) {
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
