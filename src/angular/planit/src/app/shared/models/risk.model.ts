import { CommunitySystem } from './community-system.model';
import { OrgRiskDirectionalOption } from './org-risk-directional-option.model';
import { OrgRiskRelativeOption } from './org-risk-relative-option.model';
import { WeatherEvent } from './weather-event.model';

export class Risk {
  id?: string;
  action?: string;
  weatherEvent: WeatherEvent;
  communitySystem: CommunitySystem;
  impactMagnitude?: OrgRiskRelativeOption;
  impactDescription = '';
  adaptiveCapacity?: OrgRiskRelativeOption;
  relatedAdaptiveValues?: string[] = [];
  adaptiveCapacityDescription = '';
  frequency?: OrgRiskDirectionalOption;
  intensity?: OrgRiskDirectionalOption;
  probability?: OrgRiskRelativeOption;

  constructor(object: any) {
    Object.assign(this, object);
    if (object.communitySystem) {
      this.communitySystem = Object.assign({}, object.communitySystem);
    }
    if (object.weatherEvent) {
      this.weatherEvent = Object.assign({}, object.weatherEvent);
    }
  }

  isAssessed(): boolean {
    return !!this.probability && !!this.frequency && !!this.intensity && !!this.impactMagnitude
      && !!this.adaptiveCapacity;
  }
}
