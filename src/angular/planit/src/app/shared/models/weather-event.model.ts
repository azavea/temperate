import { Concern } from './concern.model';

export class WeatherEvent {
  name: string;
  concern: Concern | null;
}
