import { Point } from 'geojson';

export class CityProperties {
  name: string;
  admin: string;
  api_city_id: string;
}

export interface City {
  type: string;
  geometry: Point;
  properties: CityProperties;
}
