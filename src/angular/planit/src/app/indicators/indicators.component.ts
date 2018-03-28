import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import {
  City,
  Indicator,
  IndicatorService
} from 'climate-change-components';

import { CityService } from '../core/services/city.service';
import { WeatherEventService } from '../core/services/weather-event.service';

import { WeatherEvent } from '../shared';

import { CollapsibleChartComponent } from '../shared/collapsible-chart/collapsible-chart.component';

interface AccordionState {
  [key: string]: boolean;
}

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html'
})
export class IndicatorsComponent implements OnInit {

  public form: FormGroup;
  public accordionState: AccordionState = {};
  public allIndicators: Indicator[];
  public filteredIndicators: Indicator[];
  public city: City;
  public filters = new Map();
  public topConcerns: WeatherEvent[];

  constructor(private indicatorService: IndicatorService,
              private weatherEventService: WeatherEventService,
              private fb: FormBuilder,
              private cityService: CityService) {}

  ngOnInit() {
    this.cityService.current().subscribe(city => { this.city = city; });

    this.indicatorService.list().subscribe(indicators => this.setupIndicators(indicators));
    this.weatherEventService.rankedEvents().subscribe(events => {
      this.topConcerns = events;
      this.setupFilters(events);
    });

    this.form = this.fb.group({ 'filter': null });
    this.form.controls.filter.valueChanges
        .subscribe(weatherEventId => this.applyFilter(weatherEventId));
  }

  public indicatorToggled(indicator: string, isOpen: boolean) {
    this.accordionState[indicator] = isOpen;
  }

  public resetFilter() {
    this.allIndicators.forEach(i => this.accordionState[i.name] = false);
    this.filteredIndicators = this.allIndicators;
  }

  public applyFilter(weatherEventId) {
    if (!weatherEventId) {
      this.resetFilter();
      return;
    }

    const selectedWeatherEvent = this.topConcerns.find(concern => concern.id === weatherEventId);

    this.filteredIndicators = this.allIndicators.filter((indicator) => {
      return selectedWeatherEvent.indicators.includes(indicator.name);
    });
  }

  private setupFilters(weatherEvents: WeatherEvent[]) {
    this.filters.set(null, { label: 'Filter by hazard...' , description: '' });

    weatherEvents.forEach((weatherEvent) => {
      if (weatherEvent.indicators && weatherEvent.indicators.length) {
        this.filters.set(weatherEvent.id, { label: weatherEvent.name, description: '' });
      }
    });
  }

  private setupIndicators(indicators: Indicator[]) {
    this.allIndicators = indicators;
    this.filteredIndicators = indicators;
    this.resetFilter();
  }
}
