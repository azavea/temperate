import { Component, OnInit } from '@angular/core';

import { AgmMap, MapsAPILoader } from '@agm/core';
import { Polygon } from 'geojson';

import { UserService } from '../core/services/user.service';
import { WeatherEventService } from '../core/services/weather-event.service';


import { CommunitySystem, Location, Organization } from '../shared';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html'
})
export class MapComponent implements OnInit {

  public location: Location;
  public polygon?: google.maps.Polygon = null;
  public polygonBounds?: google.maps.LatLngBounds = null;

  public mapStyles = [
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

  public layer: number = null;
  public layers = [
    {label: 'Wildfire hazard potential',
     mapTypeUrl: 'https://apps.fs.usda.gov/arcx/rest/services/RDW_Wildfire/RMRS_WildfireHazardPotential_2018/MapServer'},
    {label: 'Number of extreme precipitation days', county: 'extreme_precipitation_days'},
    {label: 'Air quality: ozone levels', attribute: 'ozoneP',
     featureUrl: 'http://services1.arcgis.com/PCHfdHz4GlDNAhBb/arcgis/rest/services/CES3FINAL_AGOL/FeatureServer'},
    {label: 'Air quality: PM2.5 levels', attribute: 'pmP',
     featureUrl: 'http://services1.arcgis.com/PCHfdHz4GlDNAhBb/arcgis/rest/services/CES3FINAL_AGOL/FeatureServer'},
    {label: 'Drinking water contaminants', attribute: 'drinkP',
     featureUrl: 'http://services1.arcgis.com/PCHfdHz4GlDNAhBb/arcgis/rest/services/CES3FINAL_AGOL/FeatureServer'},
  ];

  constructor(protected userService: UserService,
              protected weatherEventService: WeatherEventService,
              private mapsApiLoader: MapsAPILoader) {}

  ngOnInit() {
    this.userService.current().subscribe((user) => {
      this.location = user.primary_organization.location;

      this.mapsApiLoader.load().then(() => {
        const bounds = user.primary_organization.bounds;
        if (user.primary_organization.bounds !== null) {
          const coords = bounds.coordinates[0].slice(0, -1);
          const paths = coords.map(coord => ({lng: coord[0], lat: coord[1]}));
          this.polygonBounds = new google.maps.LatLngBounds();
          paths.forEach(path => this.polygonBounds.extend(path));
          this.polygon = new google.maps.Polygon({ paths, editable: false, draggable: false });
        }
      });
    });
  }

  onMapReady(map: google.maps.Map) {
    if (this.polygon !== null) {
      this.polygon.setMap(map);
      // zoom to fit
      map.fitBounds(this.polygonBounds);
    }
  }
}
