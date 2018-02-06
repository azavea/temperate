import {
  City,
  OrgUnitType
} from '../../shared';

export class Organization {
  id?: string;
  name: string;
  plan_due_date?: Date;
  units: OrgUnitType;
  location: City;

  constructor(object: Object) {
    Object.assign(this, object);

    // take short ISO date from JSON representation and apply timezone offset for current locale
    if (this.plan_due_date && typeof this.plan_due_date === 'string') {
      const date = new Date(this.plan_due_date);
      const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      this.plan_due_date = new Date(utc + new Date().getTimezoneOffset() * 60000);
    }
  }

  // Organization has a plan if all the required fields are populated
  public hasPlan(): boolean {
    return !!this.id && !!this.name && !!this.plan_due_date && !!this.units && !!this.location;
  }
}
