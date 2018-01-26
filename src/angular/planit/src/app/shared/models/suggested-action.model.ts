import { ActionCategory } from './action-category.model';

export class SuggestedAction {
  plan_city: string;
  plan_year: number;
  name: string;
  action_type = '';
  action_goal = '';
  implementation_details = '';
  implementation_notes = '';
  improvements_adaptive_capacity = '';
  improvements_impacts = '';
  collaborators: string[] = [];
  categories: ActionCategory[] = [];

  constructor(object: any) {
    Object.assign(this, object);
  }
}
