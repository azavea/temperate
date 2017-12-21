import { Component, Input, OnInit } from '@angular/core';

import { City,
         Indicator,
         IndicatorService } from 'climate-change-components';

import { WeatherEventService } from '../core/services/weather-event.service';
import { WeatherEvent } from '../shared';
import { IndicatorChartComponent } from './indicator-chart/indicator-chart.component';

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
  public city: City;
  public filters: WeatherEvent[] = [];

  private MAX_FILTERS = 4;

  constructor(private indicatorService: IndicatorService,
              private weatherEventService: WeatherEventService) {}

  ngOnInit() {
    this.city = {
      id: '7',
      type: 'feature',
      geometry: { type: 'Point', coordinates: [-75.16379, 39.95233] },
      properties: {
          name: 'Philadelphia',
          admin: 'PA',
          datasets: ['NEX-GDDP', 'LOCA'],
          region: 11
      },
    };

    this.indicatorService.list().subscribe(indicators => this.setupIndicators(indicators));
    this.weatherEventService.rankedEvents().subscribe(events => this.setupFilters(events));
  }

  public indicatorToggled(indicator: string, isOpen: boolean) {
    this.accordionState[indicator] = isOpen;
    // Check activeFilter state and automatically remove filter if necessary
    if (this.activeFilter) {
      const numApplied = this.activeFilter.indicators.reduce((count, i) => {
        return count + (this.accordionState[i] ? 1 : 0);
      }, 0);
      if (numApplied === 0) {
        this.activeFilter = undefined;
      }
    }
  }

  public openAccordion(indicators: string[]) {
    indicators.forEach(i => this.accordionState[i] = true);
  }

  public resetAccordion() {
    this.allIndicators.forEach(i => this.accordionState[i.name] = false);
    this.activeFilter = undefined;
  }

  public setActiveFilter(filter: WeatherEvent) {
    this.resetAccordion();
    this.activeFilter = filter;
    this.openAccordion(this.activeFilter.indicators);
  }

  private setupFilters(weatherEvents: WeatherEvent[]) {
    const events = weatherEvents.filter(e => e.indicators && e.indicators.length);
    this.filters = events.slice(0, this.MAX_FILTERS);
  }

  private setupIndicators(indicators: Indicator[]) {
    this.allIndicators = indicators;
    this.resetAccordion();
  }
}
