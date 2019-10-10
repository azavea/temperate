export enum LayerType {
  CountyGeoJSON,
  ImageArcGISRest,
  VectorTile,
}

interface LegendRowLabeled {
  color: string;
  label: string;
}

interface LegendRowGenerated {
  color: string;
  min: number;
  max: number;
}

type LegendRow = LegendRowGenerated | LegendRowLabeled;

export interface LayerConfig {
  label: string;
  type: LayerType;
  url?: string;
  attribute?: string;
  maxZoom?: number;
  showBordersAt?: number;
  externalLink?: string;
  attribution: string;
  legend: LegendRow[];
}
