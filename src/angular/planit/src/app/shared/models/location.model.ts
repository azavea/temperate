import { Point } from '../geojson';


export class Location {
  name: string;
  admin: string;
  point: Point;

  constructor(object: Object) {
    Object.assign(this, object);
  }

  public getFullName(): string {
    return this.admin ? `${this.name}, ${this.admin}` : this.name;
  }
}
