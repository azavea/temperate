import { LayerConfig } from './layer-config.model';

export interface Impact {
  label: string;
  external_download_link?: string;
  map_layer?: LayerConfig;
}
