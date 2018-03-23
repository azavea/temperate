import { Concern } from '../../shared';

export class WeatherEvent {
  id: number;
  name: string;
  coastal_only: boolean;
  concern?: Concern;
  indicators?: string[];
  display_class: string;
  description: string;
}
