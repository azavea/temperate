import { City } from './city.model';

export class Organization {
  name: string;
  units: string;
  location: City;
  weather_events: string[];

  constructor(object: Object) {
    Object.assign(this, object);
  }
}
