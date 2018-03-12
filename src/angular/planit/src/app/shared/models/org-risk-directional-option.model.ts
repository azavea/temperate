// The strings in this enum are equivalent to the available options in our API,
//  defined at planit_data.models.OrganizationRisk.Directional
// These strings should only be changed if the options in that class are changed.
export enum OrgRiskDirectionalOption {
  Decreasing = 'decreasing',
  NoChange = 'no change',
  Increasing = 'increasing',
  NotSure= 'unsure'
}
