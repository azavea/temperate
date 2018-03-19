import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { PlanService } from '../core/services/plan.service';
import { UserService } from '../core/services/user.service';
import { OrgSubscription, OrgSubscriptionOptions, OrgSubscriptionPlan, User } from '../shared';

@Component({
  selector: 'app-expiration-modal',
  templateUrl: './expiration-modal.component.html'
})
export class ExpirationModalComponent implements OnInit {
  @ViewChild('expirationModal') expirationModal: ModalDirective;
  public isModalShown = true;
  private user: User;
  public subscription: OrgSubscriptionPlan;
  public options = OrgSubscriptionOptions;

  constructor(private planService: PlanService,
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
}
