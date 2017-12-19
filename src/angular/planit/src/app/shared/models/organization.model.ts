export class Organization {
  name: string;
  units: string;
  location: number;
  weather_events: string[];

  constructor(object: Object) {
    Object.assign(this, object);
  }
}
