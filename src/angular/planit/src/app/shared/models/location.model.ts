import { Point } from '../geojson';

export class LocationProperties {
  name: string;
  admin: string;
  api_city_id: string;
}

export class Location {
  type: string;
  geometry: Point;
  properties: LocationProperties;

  constructor(object: Object) {
    Object.assign(this, object);
  }

  public getFullName(): string {
    if (!this.properties) { return undefined; }
    return `${this.properties.name}, ${this.properties.admin}`;
  }
}
