import { CommunitySystem } from './community-system.model';
import { WeatherEvent } from './weather-event.model';
import { OrgRiskDirectionalOption } from './org-risk-directional-option.model';
import { OrgRiskRelativeOption } from './org-risk-relative-option.model';

export class Risk {
  id?: string;
  action?: string;
  weatherEvent: WeatherEvent;
  communitySystem: CommunitySystem;
  impactMagnitude?: OrgRiskRelativeOption = OrgRiskRelativeOption.Null;
  impactDescription = '';
  adaptiveCapacity?: OrgRiskRelativeOption = OrgRiskRelativeOption.Null;
  relatedAdaptiveValues?: string[] = [];
  adaptiveCapacityDescription = '';
  frequency: OrgRiskDirectionalOption = OrgRiskDirectionalOption.Null;
  intensity: OrgRiskDirectionalOption = OrgRiskDirectionalOption.Null;
  probability: OrgRiskRelativeOption = OrgRiskRelativeOption.Null;

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
    if(this.probability && this.frequency && this.intensity && this.impactMagnitude
       && this.adaptiveCapacity) {
      return true;
    }
    return false;
  }
}
