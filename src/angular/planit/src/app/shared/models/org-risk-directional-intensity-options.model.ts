import { OrgRiskDirectionalOption } from './org-risk-directional-option.model';
import { OrgRiskOptionDescription } from './org-risk-option-description.model';


export const OrgRiskDirectionalIntensityOptions =
    new Map<OrgRiskDirectionalOption, OrgRiskOptionDescription>([
  [OrgRiskDirectionalOption.Decreasing, {
    label: 'Less intense',
    description: ''
  }],
  [OrgRiskDirectionalOption.NoChange, {
    label: 'No change',
    description: ''
  }],
  [OrgRiskDirectionalOption.Increasing, {
    label: 'More intense',
    description: ''
  }],
  [OrgRiskDirectionalOption.NotSure, {
    label: 'Not sure',
    description: ''
  }]
]);
