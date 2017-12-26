import { OrgRiskOptionDescription } from './org-risk-option-description.model';

export enum OrgRiskRelativeOption {
  Unsure = 'unsure',
  Low = 'low',
  ModeratelyLow = 'mod low',
  Moderate = 'moderate',
  ModeratelyHigh = 'mod high',
  High = 'high'
}

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

export const OrgRiskRelativeImpactOptions =
    new Map<OrgRiskRelativeOption, OrgRiskOptionDescription>([
  [OrgRiskRelativeOption.Unsure, {
    label: 'Unsure',
    description: ''
  }],
  [OrgRiskRelativeOption.Low, {
    label: 'Low',
    description: 'you expect that the hazard may somewhat affect the operation of critical assets' +
    ' and services across the city, is very unlikely to result in death or injury, but' +
    ' may cause minor economic disruption.'
  }],
  [OrgRiskRelativeOption.ModeratelyLow, {
    label: 'Moderately low',
    description: 'you expect that the hazard may somewhat affect the operation of' +
    ' critical assets and services across the city, is unlikely to result in death or injury, but' +
    ' may cause moderate economic disruption.'
  }],
  [OrgRiskRelativeOption.Moderate, {
    label: 'Moderate',
    description: 'you expect that the hazard may moderately affect the operation of some' +
    ' critical assets and services across the city, is unlikely to result in death or injury, but' +
    ' may cause moderate economic disruption.'
  }],
  [OrgRiskRelativeOption.ModeratelyHigh, {
    label: 'Moderately high',
    description: 'you expect that the hazard may significantly affect the operation of some' +
    ' critical assets and services across the city, and may result in the death or injury of a' +
    ' number of people and/or major economic disruption.'
  }],
  [OrgRiskRelativeOption.High, {
    label: 'High',
    description: 'you expect that the hazard may significantly affect the operation of a majority' +
    ' of critical assets and services across the city, and may result in the death or injury of a' +
    ' significant number of people and/or extreme economic disruption.'
  }]
]);
