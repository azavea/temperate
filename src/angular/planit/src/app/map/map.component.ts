import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AgmMap, MapsAPILoader } from '@agm/core';
import { LayerVectorComponent, MapComponent as OLMapComponent, ViewComponent } from 'ngx-openlayers';
import Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import * as proj from 'ol/proj';
import { ImageSourceEvent } from 'ol/source/Image';
import { Fill, Stroke, Style } from 'ol/style';

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
     mapTypeUrl: 'https://apps.fs.usda.gov/arcx/rest/services/RDW_Wildfire/RMRS_WildfireHazardPotential_2018/MapServer',
     externalLink: 'https://www.firelab.org/project/wildfire-hazard-potential',
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
    {label: 'Number of precipitation days',
     countyAttribute: 'extreme_precipitation_days',
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

  styleFeature = (feature: Feature) => {
    var val = feature.getProperties().indicators[this.layer.countyAttribute];
    if (typeof val === "object") {
      val = Object.values(val)[0];
    }

    const row = this.layer.legend.find(row => val >= row.min && val <= row.max);
    return new Style({
      stroke: new Stroke({
        color: '#ccc',
        width: 1
      }),
      fill: new Fill({
        color: row.color
      })
    });
  }

}
