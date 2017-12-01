import { Component, OnInit } from '@angular/core';

import { WeatherEventService } from '../../core/services/weather-event.service';
import { Concern } from '../models/concern.model';
import { WeatherEvent } from '../models/weather-event.model';


@Component({
  selector: 'app-top-concerns',
  templateUrl: './top-concerns.component.html',
  styleUrls: ['./top-concerns.component.scss']
})
export class TopConcernsComponent implements OnInit {

  weatherEvents: WeatherEvent[];

  constructor(private weatherEventService: WeatherEventService) {
  }

  ngOnInit() {
    this.weatherEventService.rankedEvents()
      .subscribe(weatherEvents => this.weatherEvents = weatherEvents);
  }

  weatherEventClass(weatherEvent: WeatherEvent): string {
    // TODO: Set class based on some property of the WeatherEvent (GH #251)
    return 'concern-Heat';
  }

  format(concern: Concern): string {
    if (concern.isRelative) {
      return Number(concern.value * 100).toFixed(0) + '%';
    } else {
      return Number(concern.value).toPrecision(2);
    }
  }

  hasUnits(concern: Concern): boolean {
    return !concern.isRelative && concern.units !== 'count';
  }

}
