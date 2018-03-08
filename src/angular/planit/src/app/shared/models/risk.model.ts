import * as every from 'lodash.every';
import * as some from 'lodash.some';

import { Action } from './action.model';
import { CommunitySystem } from './community-system.model';
import { OrgRiskDirectionalOption } from './org-risk-directional-option.model';
import { OrgRiskRelativeOption } from './org-risk-relative-option.model';
import { WeatherEvent } from './weather-event.model';

export class Risk {
  id?: string;
  action?: Action;
  weather_event: WeatherEvent;
  community_system: CommunitySystem;
  impact_magnitude?: OrgRiskRelativeOption;
  impact_description = '';
  adaptive_capacity?: OrgRiskRelativeOption;
  related_adaptive_values: string[] = [];
  adaptive_capacity_description = '';
  frequency?: OrgRiskDirectionalOption;
  intensity?: OrgRiskDirectionalOption;
  probability?: OrgRiskRelativeOption;

  constructor(object: any) {
    Object.assign(this, object);
    if (object.community_system) {
      this.community_system = Object.assign({}, object.community_system);
    }
    if (object.weather_event) {
      this.weather_event = Object.assign({}, object.weather_event);
    }
  }

  isAssessed(): boolean {
    return every(this.getAssessmentPropsAsBools());
  }

  isPartiallyAssessed(): boolean {
    return some(this.getAssessmentPropsAsBools());
  }

  private getAssessmentPropsAsBools(): boolean[] {
    return [
      !!this.probability,
      !!this.frequency,
      !!this.intensity,
      !!this.impact_magnitude,
      !!this.adaptive_capacity
    ];
  }
}
