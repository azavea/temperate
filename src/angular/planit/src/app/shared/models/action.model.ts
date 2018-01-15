import { ActionCategory } from './action-category.model';
import { Risk } from './risk.model';

export enum ActionVisibility {
  Public = 'public',
  Private = 'private'
}

export class Action {
  id?: string;
  action: string;
  risk: string;
  actionType: string;
  actionGoal: string;
  implementationDetails = '';
  visibility: ActionVisibility = ActionVisibility.Private;
  implementationNotes = '';
  improvementsAdaptiveCapacity: string;
  immprovementsImpacts: string;
  collaborators: string[];
  categories: ActionCategory[];
  funding: string;

  constructor(object: any) {
    Object.assign(this, object);
  }
}
