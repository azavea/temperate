import { OrgRiskDirectionalOption } from './org-risk-directional-option.model';
import { OrgRiskOptionDescription } from './org-risk-option-description.model';


export const OrgRiskDirectionalIntensityOptions =
    new Map<OrgRiskDirectionalOption, OrgRiskOptionDescription>([
  [OrgRiskDirectionalOption.NotSure, {
    label: 'Not sure',
    description: ''
  }],
  [OrgRiskDirectionalOption.NoChange, {
    label: 'No change',
    description: ''
  }],
  [OrgRiskDirectionalOption.Decreasing, {
    label: 'Less intense',
    description: ''
  }],
  [OrgRiskDirectionalOption.Increasing, {
    label: 'More intense',
    description: ''
  }]
]);
