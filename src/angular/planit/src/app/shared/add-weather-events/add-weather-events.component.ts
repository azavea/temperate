import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { WeatherEventService } from '../../core/services/weather-event.service';
import { OrgWeatherEvent } from '../models/org-weather-event.model';
import { WeatherEvent } from '../models/weather-event.model';

@Component({
  selector: 'app-add-weather-events',
  templateUrl: 'add-weather-events.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddWeatherEventsComponent),
      multi: true,
    },
  ],
})
export class AddWeatherEventsComponent implements OnInit, ControlValueAccessor {
  public selectedEvents: WeatherEvent[];
  public weatherEvents: WeatherEvent[];

  private onChange = (_: any) => {};

  constructor(private weatherEventService: WeatherEventService) {}

  ngOnInit() {
    this.weatherEventService.list().subscribe(events => (this.weatherEvents = events));
  }

  public addOrRemove(weatherEvent: WeatherEvent) {
    if (!this.isSelected(weatherEvent)) {
      this.selectedEvents.push(weatherEvent);
    } else {
      // already selected, so toggle to remove
      this.remove(weatherEvent);
    }
    this.onChange(this.selectedEvents);
  }

  public isSelected(weatherEvent: WeatherEvent) {
    return this.selectedEvents.findIndex(e => e.id === weatherEvent.id) !== -1;
  }

  public remove(weatherEvent: WeatherEvent) {
    const index = this.selectedEvents.findIndex(e => e.id === weatherEvent.id);
    if (index !== -1) {
      this.selectedEvents.splice(index, 1);
      this.onChange(this.selectedEvents);
    }
  }

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any) {}

  public writeValue(value: any) {
    this.selectedEvents = value || [];
  }
}
