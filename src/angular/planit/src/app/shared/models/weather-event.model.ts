import { Concern } from '../../shared';
import { Indicator } from 'climate-change-components';

export class WeatherEvent {
  name: string;
  coastalOnly: boolean;
  concern?: Concern;
  indicators?: string[];
  displayClass: string;
}
