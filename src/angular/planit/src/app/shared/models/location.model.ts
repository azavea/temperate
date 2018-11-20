import { Point } from '../geojson';



export class LocationProperties {
  name: string;
  admin: string;
  datasets: string[];
}


export class Location {
  geometry: Point;
  properties: LocationProperties;

  constructor(object: Object) {
    Object.assign(this, object);
  }

  public getFullName(): string {
    if (!this.properties) { return undefined; }

    if (this.properties.admin) {
      return `${this.properties.name}, ${this.properties.admin}`;
    }
    return this.properties.name;
  }
}
