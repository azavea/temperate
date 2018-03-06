import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { UserService } from '../core/services/user.service';
import {
  OrgSubscription,
  OrgSubscriptionOptions,
  OrgSubscriptionPlan,
  Organization
} from '../shared';

@Component({
  selector: 'app-plan-selector',
  templateUrl: 'plan-selector.component.html'
})
export class PlanSelectorComponent implements OnInit {

  @Input() org: Organization;
  @Output() selected = new EventEmitter<OrgSubscriptionPlan>();

  public availablePlans = Array.from(OrgSubscriptionOptions.values());

  constructor() { }

  ngOnInit() {
  }

  get activePlan(): OrgSubscriptionPlan | undefined {
    if (!this.org) {
      return undefined;
    }
    return this.availablePlans.find(plan => plan.name === this.org.subscription);
  }

  get visiblePlans() {
    return this.availablePlans.filter(p => p.visible);
  }

  public isUpgrade(plan: OrgSubscriptionPlan) {
    // return true if the passed plan is an upgrade from the active one
    //  A plan is an upgrade if the yearly cost is higher
    return plan.yearlyCost > this.activePlan.yearlyCost;
  }

  public planSelected(plan: OrgSubscriptionPlan) {
    this.selected.emit(plan);
  }
}
