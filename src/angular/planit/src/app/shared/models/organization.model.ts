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
  }

  // Organization has a plan if all the required fields are populated
  public hasPlan(): boolean {
    return !!this.id && !!this.name && !!this.plan_due_date && !!this.units && !!this.location;
  }
}
