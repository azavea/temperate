import { Concern } from '../../shared';

export class WeatherEvent {
  id: number;
  name: string;
  coastalOnly: boolean;
  concern?: Concern;
  indicators?: string[];
  displayClass: string;
}
