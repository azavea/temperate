import { Point } from 'geojson';

export interface CityProperties {
  name: string;
  api_city_id: string;
}

export interface City {
  type: string;
  geometry: Point;
  properties: CityProperties;
}
