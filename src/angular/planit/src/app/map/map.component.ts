import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { AgmMap, MapsAPILoader } from '@agm/core';
import {
  LayerVectorComponent,
  LayerVectorTileComponent,
  MapComponent as OLMapComponent,
  ViewComponent,
} from 'ngx-openlayers';
import { Polygon } from 'ol/geom';
import * as proj from 'ol/proj';
import { ImageSourceEvent } from 'ol/source/Image';
import { Fill, Stroke, Style } from 'ol/style';
import Feature from 'ol/Feature';

import { environment } from '../../environments/environment';
import { STARTING_MAP_ZOOM, WEB_MERCATOR, WGS84 } from '../core/constants/map';
import { UserService } from '../core/services/user.service';
import { WeatherEventService } from '../core/services/weather-event.service';


import { CommunitySystem, Location, Organization } from '../shared';


const BORDER_COLOR = '#ccc';

enum LayerType {
  CountyGeoJSON,
  ImageArcGISRest,
  VectorTile,
}


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html'
})
export class MapComponent implements OnInit, AfterViewInit {
  public startingZoom = STARTING_MAP_ZOOM;
  public wgs84 = WGS84;
  public webMercator = WEB_MERCATOR;

  @ViewChild(OLMapComponent, {static: true}) map;
  @ViewChild('boundsLayer', {static: true}) boundsLayer;
  @ViewChildren('countyLayer') countyLayer !: QueryList<LayerVectorComponent>;
  @ViewChildren('vectorTileLayer') vectorTileLayer !: QueryList<LayerVectorTileComponent>;

  public organization: Organization;
  public location: Location;

  public layerTypes = LayerType;
  public layerIndex: number = null;
  public layer: any = null;
  public layers = [
    {
      label: 'Wildfire hazard potential',
      type: LayerType.ImageArcGISRest,
      mapTypeUrl: 'https://apps.fs.usda.gov/arcx/rest/services/' +
                  'RDW_Wildfire/RMRS_WildfireHazardPotential_2018/MapServer',
      externalLink: 'https://www.firelab.org/project/wildfire-hazard-potential',
      attribution: 'Rocky Mountain Research Station - Fire, Fuel, and Smoke Science Program' +
                   ' - Fire Modeling Institute',
      legend: [
        {color: '#36A21E', label: 'Very low'},
        {color: '#A0FF96', label: 'Low'},
        {color: '#FEFF6E', label: 'Moderate'},
        {color: '#FFA32D', label: 'High'},
        {color: '#EE2922', label: 'Very high'},
        {color: '#E0E0E0', label: 'Non-burnable'},
        {color: '#166CFB', label: 'Water'},
      ]
    },
    {
      label: 'Number of precipitation days',
      type: LayerType.CountyGeoJSON,
      attribute: 'extreme_precipitation_days',
      attribution: 'Accessed From: https://ephtracking.cdc.gov/DataExplorer. ' +
                   'Accessed on 10/07/2019',
      legend: [
        {color: '#FFFF80', min: 0, max: 52},
        {color: '#C7E9B4', min: 53, max: 105},
        {color: '#7FCDBB', min: 106, max: 157},
        {color: '#41B6C4', min: 158, max: 209},
        {color: '#1D91C0', min: 210, max: 261},
        {color: '#225EA8', min: 262, max: 313},
        {color: '#0C2C84', min: 314, max: 365},
      ]
    },
    {
      label: 'Air quality: ozone',
      type: LayerType.VectorTile,
      vectorTileUrl: 'https://temperate-tiles.s3.amazonaws.com/calenviroscreen/{z}/{x}/{y}.pbf',
      maxZoom: 8,
      showBordersAt: 10,
      attribute: 'ozoneP',
      attribution: 'CalEnviroScreen 3.0, California Office of Environmental Health Hazard Assessment',
      legend: [
        {color: '#FFFFE5', min: 0, max: 10},
        {color: '#F3FACA', min: 11, max: 20},
        {color: '#D9F0CC', min: 21, max: 30},
        {color: '#A8DDD1', min: 31, max: 40},
        {color: '#7ECDD7', min: 41, max: 50},
        {color: '#65B4D4', min: 51, max: 60},
        {color: '#6991C4', min: 61, max: 70},
        {color: '#717EBD', min: 71, max: 80},
        {color: '#606DA1', min: 81, max: 90},
        {color: '#56647E', min: 91, max: 100},
      ]
    },
    {
      label: 'Air quality: PM 2.5',
      type: LayerType.VectorTile,
      vectorTileUrl: 'https://temperate-tiles.s3.amazonaws.com/calenviroscreen/{z}/{x}/{y}.pbf',
      maxZoom: 8,
      showBordersAt: 10,
      attribute: 'pmP',
      attribution: 'CalEnviroScreen 3.0, California Office of Environmental Health Hazard Assessment',
      legend: [
        {color: '#FFFFE5', min: 0, max: 10},
        {color: '#F3FACA', min: 11, max: 20},
        {color: '#D9F0CC', min: 21, max: 30},
        {color: '#A8DDD1', min: 31, max: 40},
        {color: '#7ECDD7', min: 41, max: 50},
        {color: '#65B4D4', min: 51, max: 60},
        {color: '#6991C4', min: 61, max: 70},
        {color: '#717EBD', min: 71, max: 80},
        {color: '#606DA1', min: 81, max: 90},
        {color: '#56647E', min: 91, max: 100},
      ]
    },
    {
      label: 'Drinking water contamination',
      type: LayerType.VectorTile,
      vectorTileUrl: 'https://temperate-tiles.s3.amazonaws.com/calenviroscreen/{z}/{x}/{y}.pbf',
      maxZoom: 8,
      showBordersAt: 10,
      attribute: 'drinkP',
      attribution: 'CalEnviroScreen 3.0, California Office of Environmental Health Hazard Assessment',
      legend: [
        {color: '#FFFFE5', min: 0, max: 10},
        {color: '#F3FACA', min: 11, max: 20},
        {color: '#D9F0CC', min: 21, max: 30},
        {color: '#A8DDD1', min: 31, max: 40},
        {color: '#7ECDD7', min: 41, max: 50},
        {color: '#65B4D4', min: 51, max: 60},
        {color: '#6991C4', min: 61, max: 70},
        {color: '#717EBD', min: 71, max: 80},
        {color: '#606DA1', min: 81, max: 90},
        {color: '#56647E', min: 91, max: 100},
      ]
    },
  ];

  private mapStyles = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [
        {
          visibility: 'off'
        }
      ]
    }
  ];

  constructor(protected userService: UserService,
              protected weatherEventService: WeatherEventService,
              private http: HttpClient,
              private mapsApiLoader: MapsAPILoader) {}

  ngOnInit() {
    this.userService.current().subscribe((user) => {
      this.organization = user.primary_organization;
      this.location = user.primary_organization.location;

      this.mapsApiLoader.load().then(() => {
        // Setup OpenLayers <-> Google connection
        // olgm module import must be delayed until Google Maps API has loaded
        const GoogleLayer = require('olgm/layer/Google.js').default;
        const OLGoogleMaps = require('olgm/OLGoogleMaps.js').default;

        const olmap = this.map.instance;

        // Set initial view extent to fit org bounds to map
        this.fitToOrganization();
        if (user.primary_organization.bounds !== null) {
          // Keep this layer in OL instead of Google so we can control zIndex
          this.boundsLayer.instance.set('olgmWatch', false);
        }

        olmap.addLayer(new GoogleLayer());
        const olGM = new OLGoogleMaps({ map: olmap, styles: this.mapStyles });
        olGM.activate();
      });
    });
  }

  ngAfterViewInit() {
    this.setupCountyLayer();
  }

  setupCountyLayer() {
    this.countyLayer.changes.subscribe(() => {
      if (this.countyLayer.length === 0) {
        return;
      }
      const countyLayer = this.countyLayer.first.instance;
      const vectorSource = countyLayer.getSource();

      vectorSource.setLoader((extent, resolution, projection) => {
        const url = `${environment.apiUrl}/api/counties/`;

        this.http.get(url, { responseType: 'text' }).subscribe((response) => {
          const olmap = this.map.instance;
          // Double-check that the layer is still visible before loading data
          if (countyLayer.getLayerState().sourceState === 'ready') {
            const features = vectorSource.getFormat().readFeatures(response);
            vectorSource.addFeatures(features);
            olmap.getView().fit(vectorSource.getExtent(), olmap.getSize());
          }
        });
      });
    });
  }

  setupVectorTileLayer() {
    if (this.vectorTileLayer.length === 0) {
      return;
    }

    // Trigger refresh of tiles
    const vectorTileLayer = this.vectorTileLayer.first.instance;
    const vectorTileSource = vectorTileLayer.getSource();
    vectorTileSource.dispatchEvent('change');
  }


  fitToOrganization() {
    const olmap = this.map.instance;
    const olview = olmap.getView();
    const bounds = this.organization.bounds;
    if (bounds !== null) {
      let extent = new Polygon(bounds.coordinates).getExtent();
      extent = proj.transformExtent(extent, proj.get(WGS84), proj.get(WEB_MERCATOR));
      olview.fit(extent, olmap.getSize());
    } else {
      const center = proj.transform(this.location.geometry.coordinates,
                                    proj.get(WGS84), proj.get(WEB_MERCATOR));
      olview.setCenter(center);
      olview.setZoom(STARTING_MAP_ZOOM);
    }
  }

  setLayer() {
    this.layer = this.layers[this.layerIndex];
    if (this.layer.type == LayerType.ImageArcGISRest || this.layer.type == LayerType.VectorTile) {
      this.fitToOrganization();
    }
    if (this.layer.type == LayerType.VectorTile) {
      this.setupVectorTileLayer();
    }
  }

  updateMapSize() {
    // Refresh container size of OL map, otherwise layers may look squashed
    this.map.instance.updateSize();
  }

  styleCountyFeature = (feature: Feature) => {
    let val = feature.getProperties().indicators[this.layer.attribute];
    // For baseline layers val will be a single numeric value
    // For Historical and projected layers, val will be an object with years
    // as keys and numbers as values
    if (typeof val === 'object') {
      val = Object.values(val)[0];
    }
    return this.styleFeature(feature, val);
  }

  styleVectorFeature = (feature: Feature) => {
    const val = feature.getProperties()[this.layer.attribute];
    return this.styleFeature(feature, val);
  }

  private styleFeature(feature: Feature, val: number) {
    const row = this.layer.legend.find(r => val >= r.min && val < r.max + 1);
    const zoom = this.map.instance.getView().getZoom();

    let strokeColor;
    if (this.layer.showBordersAt) {
      strokeColor = zoom >= this.layer.showBordersAt ? BORDER_COLOR : row.color;
    } else {
      strokeColor = BORDER_COLOR;
    }

    return new Style({
      stroke: new Stroke({
        color: strokeColor
      }),
      fill: new Fill({
        color: row.color
      })
    });
  }

}
