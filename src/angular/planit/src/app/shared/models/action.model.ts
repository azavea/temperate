import { ActionCategory } from './action-category.model';
import { Risk } from './risk.model';

export enum ActionVisibility {
  Public = 'public',
  Private = 'private'
}

export class Action {
  id?: string;
  action: string;
  risk: Risk;
  actionType?: string; // TODO: replace with action type model
  actionGoal?: string; // TODO: replace with action goal model
  implementationDetails = '';
  visibility: ActionVisibility = ActionVisibility.Private;
  implementationNotes = '';
  improvementsAdaptiveCapacity?: string;
  immprovementsImpacts?: string;
  collaborators?: string[]; // TODO: replace with collaborator model
  categories?: ActionCategory[];
  funding?: string;

  constructor(object: any) {
    Object.assign(this, object);
  }
}
