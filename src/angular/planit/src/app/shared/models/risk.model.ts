import { CommunitySystem } from './community-system.model';
import { WeatherEvent } from './weather-event.model';
import { Indicator } from 'climate-change-components';
import { OrgRiskDirectionalOption } from './org-risk-directional-option.model';
import { OrgRiskRelativeOption } from './org-risk-relative-option.model';

export class Risk {
  id?: string;
  weatherEvent: WeatherEvent;
  communitySystem: CommunitySystem;
  impactMagnitude?: string;
  impactDescription?: string;
  adaptiveCapacity?: string;
  relatedAdaptiveValues?: string[];
  adaptiveCapacityDescription?: string;
  frequency: OrgRiskDirectionalOption = OrgRiskDirectionalOption.Unsure;
  intensity: OrgRiskDirectionalOption = OrgRiskDirectionalOption.Unsure;
  probability: OrgRiskRelativeOption = OrgRiskRelativeOption.Unsure;

  constructor(object: any) {
    Object.assign(this, object);
    if (object.communitySystem) {
      this.communitySystem = Object.assign({}, object.communitySystem);
    }
    if (object.weatherEvent) {
      this.weatherEvent = Object.assign({}, object.weatherEvent);
    }
  }
}
