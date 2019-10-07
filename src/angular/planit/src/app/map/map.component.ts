import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AgmMap, MapsAPILoader } from '@agm/core';
import { LayerVectorComponent, MapComponent as OLMapComponent, ViewComponent } from 'ngx-openlayers';
import Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import * as proj from 'ol/proj';
import { ImageSourceEvent } from 'ol/source/Image';

import { UserService } from '../core/services/user.service';
import { WeatherEventService } from '../core/services/weather-event.service';
import { environment } from '../../environments/environment';


import { CommunitySystem, Location, Organization } from '../shared';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html'
})
export class MapComponent implements OnInit, AfterViewInit {

  public startingZoom = 11;

  @ViewChild(OLMapComponent, {static: true}) map;
  @ViewChild('boundsLayer', {static: true}) boundsLayer;
  @ViewChildren('countyLayer') countyLayer !: QueryList<LayerVectorComponent>;

  public organization: Organization;
  public location: Location;

  public layerIndex: number = null;
  public layer: any = null;
  public layers = [
    {label: 'Wildfire hazard potential',
     mapTypeUrl: 'https://apps.fs.usda.gov/arcx/rest/services/RDW_Wildfire/RMRS_WildfireHazardPotential_2018/MapServer'},
    {label: 'Number of extreme precipitation days', countyAttribute: 'extreme_precipitation_days'},
    {label: 'Air quality: ozone levels', attribute: 'ozoneP', srid: '3310',
     featureUrl: 'http://services1.arcgis.com/PCHfdHz4GlDNAhBb/arcgis/rest/services/CES3FINAL_AGOL/FeatureServer/1'},
    {label: 'Air quality: PM2.5 levels', attribute: 'pmP', srid: '3310',
     featureUrl: 'http://services1.arcgis.com/PCHfdHz4GlDNAhBb/arcgis/rest/services/CES3FINAL_AGOL/FeatureServer/1'},
    {label: 'Drinking water contaminants', attribute: 'drinkP', srid: '3310',
     featureUrl: 'http://services1.arcgis.com/PCHfdHz4GlDNAhBb/arcgis/rest/services/CES3FINAL_AGOL/FeatureServer/1'},
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
    this.countyLayer.changes.subscribe(() => {
      if (this.countyLayer.length === 0) {
        return;
      }
      const countyLayer = this.countyLayer.first.instance;
      const vectorSource = countyLayer.getSource();

      vectorSource.setLoader((extent, resolution, projection) => {
        var url = `${environment.apiUrl}/api/counties/`;

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

  fitToOrganization() {
    const olmap = this.map.instance;
    const olview = olmap.getView();
    const bounds = this.organization.bounds;
    if (bounds !== null) {
      var extent = new Polygon(bounds.coordinates).getExtent();
      extent = proj.transformExtent(extent, proj.get('EPSG:4326'), proj.get('EPSG:3857'));
      olview.fit(extent, olmap.getSize());
    } else {
      olview.setCenter(this.location.geometry);
      olview.setZoom(this.startingZoom);
    }
  }

  setLayer() {
    this.layer = this.layers[this.layerIndex];
    if (this.layer.mapTypeUrl) {
      this.fitToOrganization();
    }
  }
}
