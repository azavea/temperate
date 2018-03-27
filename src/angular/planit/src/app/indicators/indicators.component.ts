import { Component, Input, OnInit } from '@angular/core';

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

  public accordionState: AccordionState = {};
  public activeFilter: WeatherEvent;
  public allIndicators: Indicator[];
  public filteredIndicators: Indicator[];
  public city: City;
  public filters: WeatherEvent[] = [];
  public topConcerns: WeatherEvent[];

  constructor(private indicatorService: IndicatorService,
              private weatherEventService: WeatherEventService,
              private cityService: CityService) {}

  ngOnInit() {
    this.cityService.current().subscribe(city => { this.city = city; });

    this.indicatorService.list().subscribe(indicators => this.setupIndicators(indicators));
    this.weatherEventService.rankedEvents().subscribe(events => {
      this.topConcerns = events;
      this.setupFilters(events);
    });
  }

  public indicatorToggled(indicator: string, isOpen: boolean) {
    this.accordionState[indicator] = isOpen;
  }

  public resetFilter() {
    this.allIndicators.forEach(i => this.accordionState[i.name] = false);
    this.activeFilter = undefined;
    this.filteredIndicators = this.allIndicators;
  }

  public filterIndicators() {
    this.filteredIndicators = this.allIndicators.filter((indicator) => {
      return this.activeFilter.indicators.includes(indicator.name);
    });
  }

  public setActiveFilter(filter: WeatherEvent) {
    this.resetFilter();
    this.activeFilter = filter;
    this.filterIndicators();
  }

  private setupFilters(weatherEvents: WeatherEvent[]) {
    this.filters = weatherEvents.filter(e => e.indicators && e.indicators.length);
  }

  private setupIndicators(indicators: Indicator[]) {
    this.allIndicators = indicators;
    this.filteredIndicators = indicators;
    this.resetFilter();
  }
}
