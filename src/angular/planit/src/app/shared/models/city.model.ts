import { Point } from 'geojson';

export class CityProperties {
  name: string;
  admin: string;
  api_city_id: string;
}

export class City {
  type: string;
  geometry: Point;
  properties: CityProperties;

  constructor(object: Object) {
    Object.assign(this, object);
  }

  public getFullName(): string {
    if (!this.properties) { return undefined; }
    return `${this.properties.name}, ${this.properties.admin}`;
  }
}
