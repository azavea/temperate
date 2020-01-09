interface SpatialReference {
  wkid: string;
  latestWkid: string;
}


interface Location {
  x: number;
  y: number;
}

interface Extent {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}


export interface Candidate {
  address: string;
  location: Location;
  score: number;
  attributes: any;
  extent: Extent;
}

export interface GeocoderResponse {
 spatialReference: SpatialReference;
 candidates: Candidate[];
}


export interface Suggestion {
  text: string;
  magicKey: string;
  isCollection: boolean;
}

export interface SuggestResponse {
  suggestions: Suggestion[];
}
