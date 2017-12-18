import { Concern } from './concern.model';
import { Indicator } from 'climate-change-components';

export class WeatherEvent {
  name: string;
  concern?: Concern;
  indicators?: string[];
  displayClass: string;
}
