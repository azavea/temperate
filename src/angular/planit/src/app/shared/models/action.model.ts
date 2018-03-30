import * as every from 'lodash.every';

import { ActionCategory } from './action-category.model';
import { ActionVisibilityOption } from './action-visibility-option.model';
import { ActionVisibilityOptions } from './action-visibility-options.model';
import { Risk } from './risk.model';

export class Action {
  id?: string;
  name = '';
  risk = '';
  action_type = '';
  action_goal = '';
  implementation_details = '';
  visibility: ActionVisibilityOption = ActionVisibilityOption.Private;
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
   * An action is considered assessed if it has a name
   */
  public isAssessed() {
    return !!this.name && !!this.risk;
  }

  /**
   * An action is considered complete if all of its editable properties have been filled out
   */
  public isComplete() {
    return every(this.getPropsAsBools());
  }

  public getActionCategoriesAsCSV(): string | undefined {
    return this.categories.map(c => c.name).join(', ');
  }

  public getCompletedPropCount() {
    return this.getPropsAsBools().filter(prop => prop).length;
  }

  public getTotalPropCount() {
    return this.getPropsAsBools().length;
  }

  private getPropsAsBools() {
    return [
      !!this.name,
      !!this.risk,
      !!this.action_goal,
      !!this.action_type,
      !!this.implementation_details,
      !!this.implementation_notes,
      !!this.visibility,
      !!this.improvements_adaptive_capacity,
      !!this.improvements_impacts,
      !!this.collaborators,
      !!this.categories,
      !!this.funding
    ];
  }

  public getVisibilityLabel() {
    if (!this.visibility) { return undefined; }
    return ActionVisibilityOptions.get(this.visibility).label;
  }
}
