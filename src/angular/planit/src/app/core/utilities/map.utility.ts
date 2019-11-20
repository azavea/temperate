import { QueryList, ViewChildren } from '@angular/core';

import { Observable, of as observableOf } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';
import { applyStyle } from 'ol-mapbox-style';
import MVT from 'ol/format/MVT';
import VectorTileLayer from 'ol/layer/VectorTile';
import Map from 'ol/Map';
import { createXYZ } from 'ol/tilegrid';
import VectorTileSource from 'ol/source/VectorTile';


import basemapStyle from './basemapStyle.json';
import labelsStyle from './labelsStyle.json';


export function componentLoaded<T>(component: QueryList<T>): Observable<T> {
  if (component.first) {
    return observableOf(component.first).pipe(delay(0));
  }
  return component.changes.pipe(map(c => c.first), take(1), delay(0));
}


  // tslint:disable-next-line:max-line-length
const BASEMAP_TILE_URL = 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf';
const BASEMAP_Z_INDEX = 0;
const LABELS_Z_INDEX = 99;

export function addBasemapToMap(map: Map, labelsZIndex = LABELS_Z_INDEX) {
  const sourceOpts = {
    format: new MVT(),
    url: BASEMAP_TILE_URL
  };
  const basemapLayer = new VectorTileLayer({
    renderMode: 'image',
    source: new VectorTileSource(sourceOpts),
    zIndex: BASEMAP_Z_INDEX,
  });
  applyStyle(basemapLayer, basemapStyle, 'esri');
  map.addLayer(basemapLayer);

  const labelsLayer = new VectorTileLayer({
    renderMode: 'hybrid',
    source: new VectorTileSource(sourceOpts),
    zIndex: labelsZIndex,
  });
  applyStyle(labelsLayer, labelsStyle, 'esri');
  map.addLayer(labelsLayer);
}
