import { OrgRiskOptionDescription } from './org-risk-option-description.model';
import { OrgRiskRelativeOption } from './org-risk-relative-option.model';

export const OrgRiskRelativeImpactOptions =
    new Map<OrgRiskRelativeOption, OrgRiskOptionDescription>([
  [OrgRiskRelativeOption.Unsure, {
    label: 'Unsure',
    description: ''
  }],
  [OrgRiskRelativeOption.Low, {
    label: 'Low',
    description: 'You expect that the hazard will not affect the operation of critical assets' +
    ' and services across the city, is very unlikely to result in death or injury, but' +
    ' may cause minor economic disruption.'
  }],
  [OrgRiskRelativeOption.ModeratelyLow, {
    label: 'Moderately low',
    description: 'You expect that the hazard may somewhat affect the operation of' +
    ' critical assets and services across the city, is unlikely to result in death or injury, but' +
    ' may cause moderate economic disruption.'
  }],
  [OrgRiskRelativeOption.Moderate, {
    label: 'Moderate',
    description: 'You expect that the hazard may moderately affect the operation of some' +
    ' critical assets and services across the city, is unlikely to result in death or injury, but' +
    ' may cause moderate economic disruption.'
  }],
  [OrgRiskRelativeOption.ModeratelyHigh, {
    label: 'Moderately high',
    description: 'You expect that the hazard may significantly affect the operation of some' +
    ' critical assets and services across the city, and may result in the death or injury of a' +
    ' number of people and/or major economic disruption.'
  }],
  [OrgRiskRelativeOption.High, {
    label: 'High',
    description: 'You expect that the hazard may significantly affect the operation of a majority' +
    ' of critical assets and services across the city, and may result in the death or injury of a' +
    ' significant number of people and/or extreme economic disruption.'
  }]
]);
