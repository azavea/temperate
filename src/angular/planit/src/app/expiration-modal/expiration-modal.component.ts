import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { AuthService } from '../core/services/auth.service';
import { PlanService } from '../core/services/plan.service';
import { UserService } from '../core/services/user.service';
import { OrgSubscription, OrgSubscriptionOptions, OrgSubscriptionPlan, User } from '../shared';

@Component({
  selector: 'app-expiration-modal',
  templateUrl: './expiration-modal.component.html'
})
export class ExpirationModalComponent implements OnInit {
  @ViewChild('expirationModal') expirationModal: ModalDirective;
  public downloadDisabled = false;
  public isModalShown = true;
  private user: User;
  public subscription: OrgSubscriptionPlan;
  public options = OrgSubscriptionOptions;

  constructor(private authService: AuthService,
              private planService: PlanService,
              private userService: UserService) { }

  ngOnInit() {
    this.userService.current().subscribe(u => {
      this.user = u;
      this.subscription = this.options.get(u.primary_organization.subscription);
    });
    this.showModal();
  }

  private showModal(): void {
    this.isModalShown = true;
  }

  downloadAndLogout() {
    this.planService.export();
    this.downloadDisabled = true;
    const params = { queryParams : { expired : true } };
    window.setTimeout(() => {
      this.authService.logout('/', params);
    }, 1000);
  }
}
