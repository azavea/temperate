
export enum OrgSubscription {
  FreeTrial = 'free_trial',
  Basic = 'basic',
  Review = 'review',
  Insights = 'insights',
  Guidance = 'guidance',
  Hourly = 'hourly',
  Custom = 'custom',
}

export interface OrgSubscriptionPlan {
  name: OrgSubscription;
  nickName: string;
  fullName: string;
  yearlyCost: number;
  header: string;
  description: string;
  iconClass: string;
  visible: boolean;
  yearlyValue?: number;
}

export const OrgSubscriptionOptions = new Map<OrgSubscription, OrgSubscriptionPlan>([
  [OrgSubscription.FreeTrial, {
    name: OrgSubscription.FreeTrial,
    nickName: 'Free trial',
    fullName: 'Free trial',
    yearlyCost: 0,
    header: 'Free trial',
    // tslint:disable-next-line:max-line-length
    description: 'New users who signup automatically receive a 15 day free trial.',
    iconClass: 'icon-question',
    visible: false,
    yearlyValue: null
  }],
  [OrgSubscription.Basic, {
    name: OrgSubscription.Basic,
    nickName: 'Basic',
    fullName: 'Basic subscription',
    yearlyCost: 1500,
    header: 'App only',
    // tslint:disable-next-line:max-line-length
    description: 'Get access to all features of the application and add as many people to your team as you like.',
    iconClass: 'icon-question',
    visible: true,
    yearlyValue: null
  }],
  [OrgSubscription.Review, {
    name: OrgSubscription.Review,
    nickName: 'Review',
    fullName: 'Review subscription',
    yearlyCost: 1800,
    header: '+ 2 hrs consulting',
    // tslint:disable-next-line:max-line-length
    description: 'Backup for planners who have a good handle on adaptation planning. You will have a direct line to an ICLEI-USA expert, who will be available to review your plan.',
    iconClass: 'icon-question',
    visible: true,
    yearlyValue: 300
  }],
  [OrgSubscription.Insights, {
    name: OrgSubscription.Insights,
    nickName: 'Insights',
    fullName: 'Insights subscription',
    yearlyCost: 3000,
    header: '+ 10 hrs consulting',
    // tslint:disable-next-line:max-line-length
    description: 'Need help interpreting data? Suggestions for what risks are most vital for your city to assess? The insights package is great for cities who want a little more support and guidance as they create their adaptation plan.',
    iconClass: 'icon-question',
    visible: true,
    yearlyValue: 1500
  }],
  [OrgSubscription.Guidance, {
    name: OrgSubscription.Guidance,
    nickName: 'Guidance',
    fullName: 'Guidance subscription',
    yearlyCost: 4500,
    header: '+ 20 hrs consulting',
    // tslint:disable-next-line:max-line-length
    description: 'Get guidance and support every step of the way. By the time you submit your plan, you will have a great handle on assessing hazards, prioritizing risks, and developing strategies for your city\'s changing climate!',
    iconClass: 'icon-question',
    visible: true,
    yearlyValue: 3000
  }],
  [OrgSubscription.Custom, {
    name: OrgSubscription.Custom,
    nickName: 'Custom',
    fullName: 'Custom subscription',
    yearlyCost: 10000,
    header: 'Custom',
    // tslint:disable-next-line:max-line-length
    description: 'Need custom assistance from ICLEI-USA? We\'re happy to work with you to create a plan that fits your needs.',
    iconClass: '',
    visible: false,
    yearlyValue: null
  }],
  [OrgSubscription.Hourly, {
    name: OrgSubscription.Hourly,
    nickName: 'Pay as you go',
    fullName: 'Pay as you go subscription',
    yearlyCost: 1500,
    header: 'Pay as you go consulting',
    // tslint:disable-next-line:max-line-length
    description: 'Start with a basic package and guidance from ICLEI-USA only when you need it. Your conversations will be billed at $150/hr.',
    iconClass: '',
    visible: false,
    yearlyValue: null
  }]
]);
