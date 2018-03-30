export interface ActionPrioritized {
  consensus: boolean;
  cost_benefit: boolean;
  cost_effectiveness: boolean;
  experiment: boolean;
  multiple_criteria: boolean;
}

export interface CityProfileOption {
  name: string;
  label: string;
}

export enum CityProfileSection {
  About,
  Assessment,
  Plan,
  Action
}

export enum CityProfileSectionStatus {
  Yes = 'yes',
  No = 'no',
  NotYet = 'notyet',
  InProgress = 'inprogress',
  DontKnow = 'donotknow'
}

export class CityProfile {
  private _default_action_prioritized: ActionPrioritized = {
    consensus: false,
    cost_benefit: false,
    cost_effectiveness: false,
    experiment: false,
    multiple_criteria: false
  };

  constructor(object: any) {
    this.action_prioritized = Object.assign({}, this._default_action_prioritized);
    Object.assign(this, object);
  }

  id: number;
  organization: number;
  created_at: Date;
  modified_at: Date;
  about_economic_sector = '';
  about_operational_budget_usd?: number;
  about_adaptation_status = '';
  about_commitment_status = '';
  about_mitigation_status = '';
  about_sustainability_description = '';
  about_sustainability_progress = '';
  about_master_planning = '';
  assessment_status: CityProfileSectionStatus;
  assessment_hazards_considered = '';
  assessment_assets_considered = '';
  assessment_populations_identified = '';
  plan_status: CityProfileSectionStatus;
  plan_type = '';
  action_status: CityProfileSectionStatus;
  action_prioritized: ActionPrioritized;
  action_prioritized_description = '';

  public getCompletedPropCount(requiredOnly = false) {
    const props = requiredOnly ? this.getRequiredPropsAsBools() : this.getAllPropsAsBools();
    return props.filter(prop => prop).length;
  }

  public getTotalPropCount(requiredOnly = false) {
    const props = requiredOnly ? this.getRequiredPropsAsBools() : this.getAllPropsAsBools();
    return props.length;
  }

  public getSectionRequiredCount(section: CityProfileSection) {
    const props = this.getRequiredSectionPropsAsBools().get(section);
    return props.filter(prop => !prop).length;
  }

  public sectionCompleted(section: CityProfileSection) {
    return 0 === this.getSectionRequiredCount(section);
  }

  private getRequiredPropsAsBools() {
    return [].concat.apply([], Array.from(this.getRequiredSectionPropsAsBools().values()));
  }

  private getAllPropsAsBools() {
    return this.getRequiredPropsAsBools().concat([
      !!this.about_adaptation_status,
      !!this.about_commitment_status,
      !!this.about_mitigation_status,
      !!this.about_sustainability_description,
      !!this.about_sustainability_progress,
      !!this.about_master_planning,
      !!this.assessment_hazards_considered,
      !!this.assessment_assets_considered,
      !!this.assessment_populations_identified,
      !!this.plan_type,
      !!this.action_prioritized_description
      // We don't include action_prioritized because its valid for all the boxes to be unchecked,
      // so this prop is effectively always "filled out"
    ]);
  }

  private getRequiredSectionPropsAsBools() {
    const data = new Map<CityProfileSection, boolean[]>();
    data.set(CityProfileSection.About, [
      !!this.about_economic_sector,
      typeof this.about_operational_budget_usd === 'number',
    ]);
    data.set(CityProfileSection.Assessment, [
      !!this.assessment_status,
    ]);
    data.set(CityProfileSection.Plan, [
      !!this.plan_status,
    ]);
    data.set(CityProfileSection.Action, [
      !!this.action_status
    ]);
    return data;
  }
}
