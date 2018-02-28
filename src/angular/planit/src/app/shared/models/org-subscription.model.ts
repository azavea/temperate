
export enum OrgSubscription {
  FreeTrial = 'free_trial',
  Custom = 'custom',
  Basic = 'basic',
}

export const OrgSubscriptionOptions = new Map<OrgSubscription, string>([
  [OrgSubscription.FreeTrial, 'Free Trial'],
  [OrgSubscription.Custom, 'Custom'],
  [OrgSubscription.Basic, 'Basic'],
]);
