import { Component, OnInit, ViewChild } from '@angular/core';

import { OrganizationService } from '../core/services/organization.service';
import { UserService } from '../core/services/user.service';
import {
  OrgSubscription,
  OrgSubscriptionOptions,
  OrgSubscriptionPlan,
  User
} from '../shared';
import { ModalTemplateComponent } from '../shared/modal-template/modal-template.component';

enum SubscriptionModalStep {
  Select,
  Review
}

@Component({
  selector: 'app-manage-subscription',
  templateUrl: 'manage-subscription.component.html'
})
export class ManageSubscriptionComponent implements OnInit {

  @ViewChild('selectSubscriptionModal') subscriptionModal: ModalTemplateComponent;

  public activeModalStep = SubscriptionModalStep.Select;
  public customPlan = OrgSubscriptionOptions.get(OrgSubscription.Custom);
  public hourlyPlan = OrgSubscriptionOptions.get(OrgSubscription.Hourly);
  public modalStep = SubscriptionModalStep;
  public selectedPlan: OrgSubscriptionPlan;
  public url: string;
  public user: User;

  constructor(private organizationService: OrganizationService,
              private userService: UserService) { }

  ngOnInit() {
    this.url = document.location.href;
    this.userService.current().subscribe(user => this.user = user);
  }

  closeModal(modal: ModalTemplateComponent) {
    modal.close();
  }

  openModal(modal: ModalTemplateComponent) {
    this.activeModalStep = SubscriptionModalStep.Select;
    modal.open();
  }

  selectPlan(plan: OrgSubscriptionPlan) {
    this.selectedPlan = plan;
    this.openModal(this.subscriptionModal);
  }

  submitPlanChange(plan: OrgSubscriptionPlan) {
    if (!(this.user && this.user.primary_organization)) {
      return;
    }
    // Delay actual changes until next event loop so the form has a chance to send its POST
    //  before being removed from DOM due to the switch to the Review step
    const oldSubscription = this.user.primary_organization.subscription;
    setTimeout(() => {
      const o = Object.assign({}, this.user.primary_organization, {
        subscription: plan.name
      });
      this.organizationService.update(o).subscribe(
        org => {
          this.user = Object.assign({}, this.user, { primary_organization: org});
          this.userService.invalidate();
          this.activeModalStep = SubscriptionModalStep.Review;
        },
        error => {
          this.user.primary_organization.subscription = oldSubscription;
          this.closeModal(this.subscriptionModal);
        }
      );
    });
  }
}
