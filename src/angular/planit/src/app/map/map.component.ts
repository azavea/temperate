import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

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
          this.polygon = new google.maps.Polygon({ paths, editable: false, draggable: false });
        }
      });
    });
  }

  onMapReady(map: google.maps.Map) {
    if (this.polygon !== null) {
      this.polygon.setMap(map);
    }
  }

}
