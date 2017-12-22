import { CommunitySystem } from './community-system.model';
import { WeatherEvent } from './weather-event.model';
import { Indicator } from 'climate-change-components';

export class Risk {
  id?: string;
  weatherEvent: WeatherEvent;
  communitySystem: CommunitySystem;
  probability?: string;
  frequency?: string;
  intensity?: string;
  impactMagnitude?: string;
  impactDescription?: string;
  adaptiveCapacity?: string;
  relatedAdaptiveValues?: string[];
  adaptiveCapacityDescription?: string;

  constructor(object: Object) {
    Object.assign(this, object);
  }
}
