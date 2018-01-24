import { ActionCategory } from './action-category.model';
import { Risk } from './risk.model';

export enum ActionVisibility {
  Public = 'public',
  Private = 'private'
}

export class Action {
  id?: string;
  name = '';
  risk = '';
  action_type = '';
  action_goal = '';
  implementation_details = '';
  visibility: ActionVisibility = ActionVisibility.Private;
  implementation_notes = '';
  improvements_adaptive_capacity = '';
  improvements_impacts = '';
  collaborators: string[] = [];
  categories: ActionCategory[] = [];
  funding = '';

  constructor(object: any) {
    Object.assign(this, object);
  }
}
