import { Component } from '@angular/core';

import {
  OrgSubscription,
  OrgSubscriptionOptions
} from '../shared';

@Component({
  selector: 'app-pricing',
  templateUrl: 'pricing.component.html'
})

export class PricingComponent {

  public customPlan = OrgSubscriptionOptions.get(OrgSubscription.Custom);
  public hourlyPlan = OrgSubscriptionOptions.get(OrgSubscription.Hourly);
}
