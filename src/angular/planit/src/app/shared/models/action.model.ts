import { Risk } from './risk.model';

export class Action {
  id?: string;
  action: string;
  risk: Risk;
  actionType?: string; // TODO: replace with action type model
  actionGoal?: string; // TODO: replace with action goal model
  implementationDetails?: string;
  is_private?: boolean;
  implementationNotes?: string;
  improvementsAdaptiveCapacity?: string;
  immprovementsImpacts?: string;
  collaborators?: string[]; // TODO: replace with collaborator model
  categories?: string[]; // TODO: replace with category model
  funding?: string;

  constructor(object: any) {
    Object.assign(this, object);
  }
}
