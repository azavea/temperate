import { Indicator } from './indicator.enum';

export class Concern {
  value: number;
  tagline: string;
  isRelative: boolean;
  indicator: Indicator;
}

export const TOP_CONCERNS: Concern[] = [
  {value: 8.5, tagline: 'more rain/sleet/snow', isRelative: false,
   indicator: Indicator.Precipitation},
  {value: 5.1, tagline: 'hotter', isRelative: false,
   indicator: Indicator.Heat},
  {value: 0.24, tagline: 'more extreme events', isRelative: true,
   indicator: Indicator.ExtremeEvents},
];
