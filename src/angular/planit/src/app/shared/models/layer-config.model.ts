export enum LayerType {
  CountyGeoJSON = 'county',
  ImageArcGISRest = 'arcgis',
  VectorTile = 'vectortile',
}

interface LegendRow {
  color: string;
  label: string;
  min_value?: number;
  max_value?: number;
}

export interface LayerConfig {
  layer_type: LayerType;
  url?: string;
  attribute?: string;
  max_zoom?: number;
  show_borders_at?: number;
  external_link?: string;
  attribution: string;
  legend_units?: string;
  legend: LegendRow[];
}
