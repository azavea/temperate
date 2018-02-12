import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { WeatherEventService } from '../../core/services/weather-event.service';
import { Concern, WeatherEvent } from '../../shared';


@Component({
  selector: 'app-top-concerns',
  templateUrl: './top-concerns.component.html',
  styleUrls: ['./top-concerns.component.scss']
})
export class TopConcernsComponent implements OnInit {

  @Input() weatherEvents: WeatherEvent[];

  @Output() removed = new EventEmitter<WeatherEvent>();

  public showRemove: boolean;

  ngOnInit() {
    this.showRemove = this.removed.observers.length > 0;
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

  hasUnits(concern: Concern): boolean {
    return concern.units !== 'count';
  }

  remove(weatherEvent: WeatherEvent) {
    this.removed.emit(weatherEvent);
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
}
