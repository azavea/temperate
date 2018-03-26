export interface ActionPrioritized {
  consensus: boolean;
  cost_benefit: boolean;
  cost_effectiveness: boolean;
  experiment: boolean;
  multiple_criteria: boolean;
}

export enum CityProfileSection {
  About,
  Assessment,
  Plan,
  Action
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
  assessment_status = '';
  assessment_hazards_considered = '';
  assessment_assets_considered = '';
  assessment_populations_identified = '';
  plan_status = '';
  plan_type = '';
  action_status = '';
  action_prioritized: ActionPrioritized;
  action_prioritized_description = '';
}
