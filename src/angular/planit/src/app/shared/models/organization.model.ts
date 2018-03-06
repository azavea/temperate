import { OrgUnitType } from '../constants/units-conversion';
import { City } from './city.model';
import { OrgSubscription } from './org-subscription.model';

export class Organization {
  id?: string;
  name: string;
  created_at: Date;
  plan_due_date?: Date;
  units: OrgUnitType;
  location: City;
  subscription: OrgSubscription;
  subscription_end_date?: Date;
  subscription_pending: boolean;
  weather_events: number[];
  community_systems: number[];

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
  }

  // Organization has a plan if all the required fields are populated
  public hasPlan(): boolean {
    return !!this.id && !!this.name && !!this.plan_due_date && !!this.units && !!this.location;
  }

  public isFreeTrial(): boolean {
    return this.subscription === OrgSubscription.FreeTrial;
  }

  // An organization recieves support if they are on the free trial or have a custom plan
  public hasSupport(): boolean {
    const hasFreeTrial = this.subscription === OrgSubscription.FreeTrial &&
                         this.trialDaysRemaining() > 0;
    const hasCustomPlan = this.subscription !== OrgSubscription.FreeTrial &&
                          this.subscription !== OrgSubscription.Basic;

    return (hasFreeTrial || hasCustomPlan);
  }

  public trialDaysRemaining() {
    if (!this.subscription_end_date) {
      return 0;
    }
    const oneDayMillis = 1000 * 60 * 60 * 24;
    const now = new Date();
    const daysRemaining = Math.ceil(
      (this.subscription_end_date.getTime() - now.getTime()) / oneDayMillis
    );
    return Math.max(daysRemaining, 0);
  }

  // take short ISO date from JSON representation and apply timezone offset for current locale
  private createDateFromShortISO(date_string: string): Date {
    const date = new Date(date_string);
    const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return new Date(utc + new Date().getTimezoneOffset() * 60000);
  }
}
