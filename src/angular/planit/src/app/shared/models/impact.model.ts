import { LayerConfig } from './layer-config.model';

export interface ImpactCommunitySystemRank {
  community_system: number;
  order: number;
}

export interface ImpactWeatherEventRank {
  weather_event: number;
  order: number;
}

export interface Impact {
  label: string;
  external_download_link?: string;
  map_layer?: LayerConfig;
  community_system_ranks: ImpactCommunitySystemRank[];
  weather_event_ranks: ImpactWeatherEventRank[];
  tagline?: string;
}
