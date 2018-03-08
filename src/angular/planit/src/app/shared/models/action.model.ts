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

  /**
   * An action is considered assessed if a few key editable properties have been filled out
   */
  public isAssessed() {
    return !!this.name &&
           !!this.risk &&
           !!this.action_goal &&
           !!this.action_type &&
           !!this.improvements_adaptive_capacity &&
           !!this.improvements_impacts;
  }

  /**
   * An action is considered complete if all of its editable properties have been filled out
   */
  public isComplete() {
    return !!this.name &&
           !!this.risk &&
           !!this.action_goal &&
           !!this.action_type &&
           !!this.implementation_details &&
           !!this.visibility &&
           !!this.improvements_adaptive_capacity &&
           !!this.improvements_impacts &&
           !!this.collaborators &&
           !!this.categories &&
           !!this.funding;
  }
}
