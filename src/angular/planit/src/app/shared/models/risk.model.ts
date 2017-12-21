import { CommunitySystem } from './community-system.model';
import { WeatherEvent } from './weather-event.model';
import { Indicator } from 'climate-change-components';

export class Risk {
  id?: string; // FIXME: make required when no longer using dummy data
  name?: string; // FIXME: remove from assessment dummy data
  weatherEvent?: WeatherEvent; // FIXME: make required
  communitySystem?: CommunitySystem; // FIXME: make required
  probability?: string;
  frequency?: string;
  intensity?: string;
  impactMagnitude?: string;
  impactDescription?: string;
  adaptiveCapacity?: string;
  relativeAdaptiveValues?: string[]; // TODO: what type are these?
  adaptiveCapacityDescription?: string;

  constructor(object: Object) {
    Object.assign(this, object);
  }
}
