import { Component } from '@angular/core';

import {
  OrgSubscription,
  OrgSubscriptionOptions
} from '../shared';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pricing',
  templateUrl: 'pricing.component.html'
})

export class PricingComponent {

  public customPlan = OrgSubscriptionOptions.get(OrgSubscription.Custom);
  public hourlyPlan = OrgSubscriptionOptions.get(OrgSubscription.Hourly);
  public supportEmail = environment.supportEmail;
  public hostname = window.location.hostname;
}
