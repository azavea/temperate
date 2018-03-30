import { ActionOptionDescription } from './action-option-description.model';
import { ActionVisibilityOption } from './action-visibility-option.model';

export const ActionVisibilityOptions =
    new Map<ActionVisibilityOption, ActionOptionDescription>([
  [ActionVisibilityOption.Public, {
    label: 'Shared',
    description: ''
  }],
  [ActionVisibilityOption.Private, {
    label: 'Private',
    description: ''
  }]
]);
