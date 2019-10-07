import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AgmMap, MapsAPILoader } from '@agm/core';
import { MapComponent as OLMapComponent, SourceGeoJSONComponent, ViewComponent } from 'ngx-openlayers';
import { Polygon } from 'ol/geom';
import * as proj from 'ol/proj';

import { UserService } from '../core/services/user.service';
import { WeatherEventService } from '../core/services/weather-event.service';
import { environment } from '../../environments/environment';


import { CommunitySystem, Location, Organization } from '../shared';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html'
})
export class MapComponent implements OnInit, AfterViewInit {

  @ViewChild(OLMapComponent, {static: true}) map;
  @ViewChild('boundsLayer', {static: true}) boundsLayer;
  @ViewChildren('countySource') countySource !: QueryList<SourceGeoJSONComponent>;

  public organization: Organization;
  public location: Location;

  public layer: number = null;
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
        const bounds = user.primary_organization.bounds;
        if (user.primary_organization.bounds !== null) {
          var extent = new Polygon(bounds.coordinates).getExtent();
          extent = proj.transformExtent(extent, proj.get('EPSG:4326'), proj.get('EPSG:3857'));
          olmap.getView().fit(extent, olmap.getSize());
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
    this.countySource.changes.subscribe(() => {
      if (this.countySource.length === 0) {
        return;
      }
      const vectorSource = this.countySource.first.instance;

      vectorSource.setLoader((extent, resolution, projection) => {
        var url = `${environment.apiUrl}/api/counties/`;

        this.http.get(url, { responseType: 'text' }).subscribe((response) => {
          const features = vectorSource.getFormat().readFeatures(response);
          vectorSource.addFeatures(features);
        });
      });
    });
  }
}
