
export enum OrgSubscription {
  FreeTrial = 'free_trial',
  Custom = 'custom',
}

export const OrgSubscriptionOptions = new Map<OrgSubscription, string>([
  [OrgSubscription.FreeTrial, 'Free Trial'],
  [OrgSubscription.Custom, 'Custom']
]);
