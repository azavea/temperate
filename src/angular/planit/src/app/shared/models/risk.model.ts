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

  title(): string {
    const communitySystem = this.community_system && this.community_system.name
      ? this.community_system.name : '--';
    const weatherEvent = this.weather_event && this.weather_event.name
      ? this.weather_event.name : '--';
    return `${weatherEvent} on ${communitySystem.toLowerCase()}`;
  }

  isAssessed(): boolean {
    return every(this.getAssessmentPropsAsBools());
  }

  isPartiallyAssessed(): boolean {
    return some(this.getAssessmentPropsAsBools());
  }

  public getCompletedRequiredPropCount() {
    return this.getPropsAsBools().filter(prop => prop).length;
  }

  public getTotalRequiredPropCount() {
    return this.getPropsAsBools().length;
  }

  private getPropsAsBools(): boolean[] {
    return [
      !!this.weather_event,
      !!this.community_system,
      !!this.impact_magnitude,
      !!this.impact_description,
      !!this.adaptive_capacity,
      !!this.related_adaptive_values,
      !!this.adaptive_capacity_description,
      !!this.frequency,
      !!this.intensity,
      !!this.probability
    ];
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
