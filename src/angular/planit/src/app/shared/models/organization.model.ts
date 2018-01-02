import { City,
         OrgUnitType } from '../../shared';

export class Organization {
  name: string;
  units: OrgUnitType;
  location: City;
  weather_events: string[];

  constructor(object: Object) {
    Object.assign(this, object);
  }
}
