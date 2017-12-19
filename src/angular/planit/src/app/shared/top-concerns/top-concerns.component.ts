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

  format(concern: Concern): string {
    if (!concern.isRelative) {
      // Absolute increase show the value directly
      return parseFloat(Number(concern.value).toPrecision(2)).toString();
    } else if (concern.value >= 1) {
      // If it's greater than 100% growth, use NN× format
      return Number(concern.value).toFixed(1);
    } else {
      // For smaller relative increases, display the % growth
      return Number(concern.value * 100).toFixed(0);
    }
  }

  hasUnits(concern: Concern): boolean {
    return concern.units !== 'count';
  }

  units(concern: Concern): string {
    if (!concern.isRelative) {
      // Absolute increase show the value directly
      return concern.units;
    } else if (concern.value >= 1) {
      // If it's greater than 100% growth, use NN× format
      return '×';
    } else {
      // For smaller relative increases, display the % growth
      return '%';
    }
  }
}
