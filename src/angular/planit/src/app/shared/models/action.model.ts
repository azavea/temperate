import { ActionCategory } from './action-category.model';
import { Risk } from './risk.model';

export enum ActionVisibility {
  Public = 'public',
  Private = 'private'
}

export class Action {
  id?: string;
  name = '';
  risk?: string;
  actionType = '';
  actionGoal = '';
  implementationDetails = '';
  visibility: ActionVisibility = ActionVisibility.Private;
  implementationNotes = '';
  improvementsAdaptiveCapacity = '';
  immprovementsImpacts = '';
  collaborators: string[] = [];
  categories: ActionCategory[] = [];
  funding = '';

  constructor(object: any) {
    Object.assign(this, object);
  }
}
