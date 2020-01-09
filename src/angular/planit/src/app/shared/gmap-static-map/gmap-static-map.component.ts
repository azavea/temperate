import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, Output } from '@angular/core';

import { Polygon } from 'geojson';

import { environment } from '../../../environments/environment';
import { STARTING_MAP_ZOOM } from '../../core/constants/map';


// request static Google map image sized this many pixels, squared
const IMAGE_SIZE_PX = '200';
const MAPTYPE = 'roadmap';
// Google static maps path styling docs:
// https://developers.google.com/maps/documentation/maps-static/dev-guide#Paths
// border color is $brand-teal; fill color is $brand-teal-v-light
const PATH_STYLE = 'weight:3|color:0x46b6ae|fillcolor:0xd3eae9|';
// round coordiantes to this many decimal places (max used by Google Maps API)
const ROUND_COORD_PLACES = 6;
const STATIC_MAP_BASE_URL = 'https://maps.googleapis.com/maps/api/staticmap?';


@Component({
  selector: 'app-gmap-static-map',
  templateUrl: './gmap-static-map.component.html'
})
export class GmapStaticMapComponent implements OnInit {

  @Input() public bounds: Polygon;
  @Input() public latitude: number;
  @Input() public longitude: number;
  @Output() public srcUrl: string = null;

  ngOnInit() {
    this.setSrcUrl();
  }

  // build the image source URL to request from the Google static maps API
  setSrcUrl() {
    let params = new HttpParams();
    params = params.set('size', `${IMAGE_SIZE_PX}x${IMAGE_SIZE_PX}`);
    params = params.set('maptype', MAPTYPE);
    params = params.set('key', environment.googleMapsApiKey);

    if (this.bounds) {
      // display bounds as a path
      const bounds = this.bounds.coordinates[0].reduce((accumulator, coord) => (
        `${accumulator}${coord[1].toFixed(ROUND_COORD_PLACES)},
          ${coord[0].toFixed(ROUND_COORD_PLACES)}|`
      ), PATH_STYLE).slice(0, -1);
      params = params.set('path', bounds);
    } else {
      // center on given point location
      const center = `${this.latitude.toFixed(ROUND_COORD_PLACES)},
        ${this.longitude.toFixed(ROUND_COORD_PLACES)}`;
      params = params.set('center', center);
      params = params.set('zoom', STARTING_MAP_ZOOM);
    }

    this.srcUrl = STATIC_MAP_BASE_URL + params.toString();
  }
}
