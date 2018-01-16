import { OrgRiskOptionDescription } from './org-risk-option-description.model';

export enum OrgRiskDirectionalOption {
  Null = '',
  Unsure = 'unsure',
  NoChange = 'no change',
  Increasing = 'increasing',
  Decreasing = 'decreasing'
}

export const OrgRiskDirectionalOptions =
    new Map<OrgRiskDirectionalOption, OrgRiskOptionDescription>([
  [OrgRiskDirectionalOption.Unsure, {
    label: 'Null',
    description: ''
  }],
  [OrgRiskDirectionalOption.Unsure, {
    label: 'Unsure',
    description: ''
  }],
  [OrgRiskDirectionalOption.NoChange, {
    label: 'No change',
    description: ''
  }],
  [OrgRiskDirectionalOption.Increasing, {
    label: 'Increasing',
    description: ''
  }],
  [OrgRiskDirectionalOption.Decreasing, {
    label: 'Decreasing',
    description: ''
  }]
]);
