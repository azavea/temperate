import { OrgRiskDirectionalOption } from './org-risk-directional-option.model';
import { OrgRiskRelativeOption } from './org-risk-relative-option.model';
import { WeatherEvent } from './weather-event.model';

export interface OrgWeatherEvent {
  id: number;
  weather_event: WeatherEvent;
  order: number;
  frequency?: OrgRiskDirectionalOption;
  intensity?: OrgRiskDirectionalOption;
  probability?: OrgRiskRelativeOption;
}
