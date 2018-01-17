import { OrgRiskOptionDescription } from './org-risk-option-description.model';
import { OrgRiskRelativeOption } from './org-risk-relative-option.model';

export const OrgRiskRelativeChanceOptions =
    new Map<OrgRiskRelativeOption, OrgRiskOptionDescription>([
  [OrgRiskRelativeOption.Unsure, {
    label: 'Unsure',
    description: ''
  }],
  [OrgRiskRelativeOption.Low, {
    label: 'Low',
    description: 'Not likely (between a 1 in 2,000 and 1 in 20,000 chance of occurring)'
  }],
  [OrgRiskRelativeOption.ModeratelyLow, {
    label: 'Moderately low',
    description: 'Somewhat unlikely (between a 1 in 200 and 1 in 2,000 chance of occurring)'
  }],
  [OrgRiskRelativeOption.Moderate, {
    label: 'Moderate',
    description: 'Likely (between a 1 in 20 and 1 in 200 chance of occurring)'
  }],
  [OrgRiskRelativeOption.ModeratelyHigh, {
    label: 'Moderately high',
    description: 'Highly likely (between a 1 in 2 and 1 in 20 chance of occurring)'
  }],
  [OrgRiskRelativeOption.High, {
    label: 'High',
    description: 'Very likely (between a 1 in 1 and 1 in 2 chance of occurring)'
  }]
]);
