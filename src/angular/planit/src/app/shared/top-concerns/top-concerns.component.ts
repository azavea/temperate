import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { WeatherEventService } from '../../core/services/weather-event.service';
import { Concern, WeatherEvent } from '../../shared';


@Component({
  selector: 'app-top-concerns',
  templateUrl: './top-concerns.component.html'
})
export class TopConcernsComponent implements OnChanges {

  @Input() weatherEvents: WeatherEvent[];
  @Input() readOnlyEvents: WeatherEvent[];

  @Output() removed = new EventEmitter<WeatherEvent>();

  public areConcernsCalculated = 0; // Input data not yet received during component initialization

  ngOnChanges() {
    this.areConcernsCalculated += 1;
  }

  format(concern: Concern): string {
    if (!concern.is_relative) {
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

  hasConcern(weatherEvent: WeatherEvent) {
    return weatherEvent.concern && typeof weatherEvent.concern === 'object';
  }

  hasUnits(concern: Concern): boolean {
    return concern.units !== 'count' && concern.units !== 'days';
  }

  isReadOnly(weatherEvent: WeatherEvent) {
    return this.readOnlyEvents &&
      this.readOnlyEvents.findIndex(e => e.id === weatherEvent.id) !== -1;
  }

  remove(weatherEvent: WeatherEvent) {
    // Only remove if readOnlyEvents unset or we don't find the event in readOnlyEvents
    if (!this.isReadOnly(weatherEvent)) {
      this.removed.emit(weatherEvent);
    }
  }

  units(concern: Concern): string {
    if (!concern.is_relative) {
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

  isLoaded(): boolean {
    // TODO: Rename to hasWeatherEvents or something
    return this.readOnlyEvents.length > 0 || this.weatherEvents.length > 0;
  }
}
