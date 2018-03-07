import { OrgRiskOptionDescription } from './org-risk-option-description.model';
import { OrgRiskDirectionalOption } from './org-risk-directional-option.model';


export const OrgRiskDirectionalFrequencyOptions =
    new Map<OrgRiskDirectionalOption, OrgRiskOptionDescription>([
  [OrgRiskDirectionalOption.NotSure, {
    label: 'Not sure',
    description: ''
  }],
  [OrgRiskDirectionalOption.NoChange, {
    label: 'No change',
    description: ''
  }],
  [OrgRiskDirectionalOption.Increasing, {
    label: 'Less frequent',
    description: ''
  }],
  [OrgRiskDirectionalOption.Decreasing, {
    label: 'More frequent',
    description: ''
  }]
]);
