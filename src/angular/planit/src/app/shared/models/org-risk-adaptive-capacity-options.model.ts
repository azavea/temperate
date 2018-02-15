import { OrgRiskOptionDescription } from './org-risk-option-description.model';
import { OrgRiskRelativeOption } from './org-risk-relative-option.model';

export const OrgRiskAdaptiveCapacityOptions =
    new Map<OrgRiskRelativeOption, OrgRiskOptionDescription>([
  [OrgRiskRelativeOption.Unsure, {
    label: 'Unsure',
    description: ''
  }],
  [OrgRiskRelativeOption.Low, {
    label: 'Low',
    description: 'Almost no (or no) ability to respond to potential change.'
  }],
  [OrgRiskRelativeOption.ModeratelyLow, {
    label: 'Moderately low',
    description: 'Limited ability to respond to potential change.'
  }],
  [OrgRiskRelativeOption.Moderate, {
    label: 'Moderate',
    description: 'May or may not have ability to respond to potential change.'
  }],
  [OrgRiskRelativeOption.ModeratelyHigh, {
    label: 'Moderately high',
    description: 'Some ability to respond to potential change.'
  }],
  [OrgRiskRelativeOption.High, {
    label: 'High',
    description: 'Significant ability to respond to potential change.'
  }]
]);
