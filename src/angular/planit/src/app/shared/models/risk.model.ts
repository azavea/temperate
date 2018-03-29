import * as every from 'lodash.every';
import * as some from 'lodash.some';

import { Action } from './action.model';
import { CommunitySystem } from './community-system.model';
import { OrgRiskAdaptiveCapacityOptions } from './org-risk-adaptive-capacity-options.model';
import { OrgRiskDirectionalFrequencyOptions } from './org-risk-directional-frequency-options.model';
import { OrgRiskDirectionalIntensityOptions } from './org-risk-directional-intensity-options.model';
import { OrgRiskDirectionalOption } from './org-risk-directional-option.model';
import { OrgRiskRelativeChanceOptions } from './org-risk-relative-chance-options.model';
import { OrgRiskRelativeImpactOptions } from './org-risk-relative-impact-options.model';
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

  static areAnyRisksAssessed(risks: Risk[]): boolean {
    return !!risks.find(risk => risk.isAssessed());
  }

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

  compare(other: Risk): number {
    if (this.weather_event.name !== other.weather_event.name) {
      return this.weather_event.name < other.weather_event.name ? -1 : 1;
    }
    return this.community_system.name < other.community_system.name ? -1 : 1;
  }

  public getCompletedPropCount() {
    return this.getPropsAsBools().filter(prop => prop).length;
  }

  public getTotalPropCount() {
    return this.getPropsAsBools().length;
  }

  public getAdaptiveCapacityLabel() {
    if (!this.adaptive_capacity) { return undefined; }
    return OrgRiskAdaptiveCapacityOptions.get(this.adaptive_capacity).label;
  }

  public getProbabilityLabel() {
    if (!this.probability) { return undefined; }
    return OrgRiskRelativeChanceOptions.get(this.probability).label;
  }

  public getFrequencyLabel() {
    if (!this.frequency) { return undefined; }
    return OrgRiskDirectionalFrequencyOptions.get(this.frequency).label;
  }

  public getIntensityLabel() {
    if (!this.intensity) { return undefined; }
    return OrgRiskDirectionalIntensityOptions.get(this.intensity).label;
  }

  public getImpactMagnitudeLabel() {
    if (!this.impact_magnitude) { return undefined; }
    return OrgRiskRelativeImpactOptions.get(this.impact_magnitude).label;
  }

  private getPropsAsBools(): boolean[] {
    // Do not include weather_event and community_system. They are required, but cannot be left
    //  blank in the wizards, so we omit them from progressbar completion
    return [
      !!this.frequency,
      !!this.intensity,
      !!this.probability,
      !!this.impact_magnitude,
      !!this.impact_description,
      !!this.adaptive_capacity,
      !!this.adaptive_capacity_description,
      !!this.related_adaptive_values
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
