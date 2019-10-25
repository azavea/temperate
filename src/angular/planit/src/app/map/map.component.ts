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
import GeoJSON from 'ol/format/GeoJSON';
import { Polygon } from 'ol/geom';
import * as proj from 'ol/proj';
import { ImageSourceEvent } from 'ol/source/Image';
import { Fill, Stroke, Style } from 'ol/style';
import Feature from 'ol/Feature';
import { BehaviorSubject } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { STARTING_MAP_ZOOM, WEB_MERCATOR, WGS84 } from '../core/constants/map';
import { ImpactService } from '../core/services/impact.service';
import { UserService } from '../core/services/user.service';
import { WeatherEventService } from '../core/services/weather-event.service';


import { CommunitySystem, Impact, LayerConfig, LayerType, Location, Organization } from '../shared';


const BORDER_COLOR = '#ccc';
const PARSEINT_RADIX = 10; // eslint complains if parseInt is called without an explicit radix


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html'
})
export class MapComponent implements OnInit, AfterViewInit {
  public startingZoom = STARTING_MAP_ZOOM;
  public wgs84 = WGS84;
  public webMercator = WEB_MERCATOR;

  @ViewChild(OLMapComponent, {static: false}) map;
  @ViewChildren('boundsLayer') boundsLayer;
  @ViewChildren('countyLayer') countyLayer !: QueryList<LayerVectorComponent>;
  @ViewChildren('vectorTileLayer') vectorTileLayer !: QueryList<LayerVectorTileComponent>;

  public organization: Organization;
  public location: Location;

  public layerTypes = LayerType;
  public layerIndex: number = null;
  public layer: LayerConfig = null;
  public impact: Impact = null;
  public impacts: Impact[] = null;

  public selectedYear = 0;
  public sliderConfig: any = {
    start: 0,
    step: 1,
    pips: {
      mode: 'positions',
      values: [0, 25, 50, 75, 100],
      density: 4,
      stepped: true
    }
  };

  public sliderMin = 0;
  public sliderMax = 100;
  public showSlider = false;
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
  private selectedYearIndex = 0;

  private counties: BehaviorSubject<Feature[]> = new BehaviorSubject(undefined);

  constructor(protected userService: UserService,
              protected weatherEventService: WeatherEventService,
              private http: HttpClient,
              private impactService: ImpactService,
              private mapsApiLoader: MapsAPILoader) {}

  ngOnInit() {
    this.getCounties();
    this.setupMap();
    this.selectedYearIndex = 0;

    this.userService.current().subscribe((user) => {
      this.organization = user.primary_organization;
      this.location = user.primary_organization.location;
    });
    this.impactService.list().subscribe((impacts) => {
      this.impacts = impacts.filter(i => i.map_layer);
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
        this.counties.subscribe(counties => {
          if (!counties) {
            return;
          }
          const olmap = this.map.instance;
          // Double-check that the layer is still visible before loading data
          if (countyLayer.getLayerState().sourceState === 'ready') {
            this.setupSlider(counties);
            vectorSource.addFeatures(counties);
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
    vectorTileSource.changed();
  }

  changeLayerYear(newYear) {
    this.selectedYearIndex = newYear - this.sliderMin;
    // tell map to update the layer
    const layer = this.countyLayer.first;
    if (layer) {
      layer.instance.getSource().changed();
    }
  }

  setupSlider(features) {
    if (!features || !features.length || typeof features[0] !== 'object') {
      this.showSlider = false;
      return;
    }
    const val = features[0].getProperties().indicators[this.layer.attribute];
    const years = Object.keys(val);
    const minYear = parseInt(years[0], PARSEINT_RADIX);
    const maxYear = parseInt(years[years.length - 1], PARSEINT_RADIX);
    this.sliderMin = minYear;
    this.sliderMax = maxYear;
    // Default to the last available year
    this.selectedYear = this.sliderMax;
    this.selectedYearIndex = this.sliderMax - this.sliderMin;
    this.showSlider = true;
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
    this.showSlider = false;
    this.impact = this.impacts[this.layerIndex];
    if (this.impact) {
      this.layer = this.impact.map_layer;
      if (this.layer.layer_type === LayerType.ImageArcGISRest ||
          this.layer.layer_type === LayerType.VectorTile) {
        this.fitToOrganization();
      }
      if (this.layer.layer_type === LayerType.VectorTile) {
        this.setupVectorTileLayer();
      }
    } else {
      this.layer = null;
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
      val = Object.values(val)[this.selectedYearIndex];
    }
    return this.styleFeature(feature, val);
  }

  styleVectorFeature = (feature: Feature) => {
    const val = feature.getProperties()[this.layer.attribute];
    return this.styleFeature(feature, val);
  }

  private styleFeature(feature: Feature, val: number) {
    const row = this.layer.legend.find(r => val >= r.min_value && val < r.max_value + 1);
    const zoom = this.map.instance.getView().getZoom();

    let strokeColor;
    if (this.layer.show_borders_at) {
      strokeColor = zoom >= this.layer.show_borders_at ? BORDER_COLOR : row.color;
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

  private getCounties() {
    const url = `${environment.apiUrl}/api/counties/`;

    this.http.get(url, { responseType: 'text' }).subscribe(response => {
      this.counties.next(new GeoJSON({ featureProjection: WEB_MERCATOR }).readFeatures(response));
    });
  }

  private setupMap() {
    this.mapsApiLoader.load().then(() => {
      // Setup OpenLayers <-> Google connection
      // olgm module import must be delayed until Google Maps API has loaded
      const GoogleLayer = require('olgm/layer/Google.js').default;
      const OLGoogleMaps = require('olgm/OLGoogleMaps.js').default;

      // Wait for bounds layer to be visible before setting up OLGM connection
      // This means the map and impacts will also have loaded at this point
      this.boundsLayer.changes.pipe(take(1)).subscribe(() => {
        const olmap = this.map.instance;

        // Set initial view extent to fit org bounds to map
        this.fitToOrganization();
        if (this.organization.bounds !== null) {
          // Keep this layer in OL instead of Google so we can control zIndex
          this.boundsLayer.first.instance.set('olgmWatch', false);
        }

        olmap.addLayer(new GoogleLayer());
        const olGM = new OLGoogleMaps({ map: olmap, styles: this.mapStyles });
        olGM.activate();
      });
    });
  }
}
