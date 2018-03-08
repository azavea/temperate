import { WeatherEvent } from './weather-event.model';

export interface OrgWeatherEvent {
  id: number;
  weather_event: WeatherEvent;
  order: number;
}
