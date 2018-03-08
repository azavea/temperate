import { OrgRiskDirectionalOption } from './org-risk-directional-option.model';
import { OrgRiskOptionDescription } from './org-risk-option-description.model';


export const OrgRiskDirectionalFrequencyOptions =
    new Map<OrgRiskDirectionalOption, OrgRiskOptionDescription>([
  [OrgRiskDirectionalOption.Decreasing, {
    label: 'Less frequent',
    description: ''
  }],
  [OrgRiskDirectionalOption.NoChange, {
    label: 'No change',
    description: ''
  }],
  [OrgRiskDirectionalOption.Increasing, {
    label: 'More frequent',
    description: ''
  }],
  [OrgRiskDirectionalOption.NotSure, {
    label: 'Not sure',
    description: ''
  }]
]);
