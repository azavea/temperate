import { Polygon } from 'geojson';

import { OrgUnitType } from '../constants/units-conversion';
import { Location } from './location.model';
import { OrgSubscription } from './org-subscription.model';

export class Organization {
  id?: number;
  name: string;
  created_at: Date;
  plan_due_date?: Date;
  plan_setup_complete?: boolean;
  units: OrgUnitType;
  location: Location;
  bounds?: Polygon;
  subscription: OrgSubscription;
  subscription_end_date?: Date;
  subscription_pending: boolean;
  weather_events: number[];
  community_systems: number[];
  invites?: string[];
  users?: string[];

  constructor(object: Object) {
    Object.assign(this, object);

    if (this.plan_due_date && typeof this.plan_due_date === 'string') {
      this.plan_due_date = this.createDateFromShortISO(this.plan_due_date);
    }
    if (this.created_at && typeof this.created_at === 'string') {
      this.created_at = new Date(this.created_at);
    }
    if (this.subscription_end_date && typeof this.subscription_end_date === 'string') {
      this.subscription_end_date = new Date(this.subscription_end_date);
    }
    if (this.location) {
      this.location = new Location(this.location);
    }
  }

  public hasPlan(): boolean {
    return !!this.id && !!this.plan_setup_complete;
  }

  public isFreeTrial(): boolean {
    return this.subscription === OrgSubscription.FreeTrial;
  }

  // An organization recieves support if they are on the free trial or have a custom plan
  public hasSupport(): boolean {
    const hasFreeTrial = this.subscription === OrgSubscription.FreeTrial &&
                         this.trialMillisRemaining() > 0;
    const hasCustomPlan = this.subscription !== OrgSubscription.FreeTrial &&
                          this.subscription !== OrgSubscription.Basic;

    return (hasFreeTrial || hasCustomPlan);
  }

  public isExpired(): boolean {
    return this.trialMillisRemaining() <= 0;
  }

  private trialMillisRemaining() {
    if (!this.subscription_end_date) {
      return 0;
    }
    const now = new Date();
    return this.subscription_end_date.getTime() - now.getTime();
  }

  public trialDaysRemaining() {
    const oneDayMillis = 1000 * 60 * 60 * 24;
    const daysRemaining = Math.floor(this.trialMillisRemaining() / oneDayMillis);
    return Math.max(daysRemaining, 1);
  }

  // take short ISO date from JSON representation and apply timezone offset for current locale
  private createDateFromShortISO(date_string: string): Date {
    const date = new Date(date_string);
    const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return new Date(utc + new Date().getTimezoneOffset() * 60000);
  }
}
