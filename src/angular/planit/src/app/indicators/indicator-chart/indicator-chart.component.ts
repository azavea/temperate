import { Component, OnInit, Input } from '@angular/core';
import { Point } from 'geojson';

import {
  Chart,
  ChartData,
  City,
  ClimateModel,
  Dataset,
  Indicator,
  IndicatorRequestOpts,
  IndicatorQueryParams,
  Scenario
} from 'climate-change-components';

import {
  DEFAULT_DATASET,
  DEFAULT_SCENARIO
} from '../indicator-defaults';


@Component({
  selector: 'app-indicator-chart',
  templateUrl: './indicator-chart.component.html'
})
export class IndicatorChartComponent implements OnInit {

  @Input() indicator: Indicator;
  @Input() city: City;

  public dataset: Dataset = DEFAULT_DATASET;
  public extraParams: IndicatorQueryParams;
  public isCollapsed = false;
  public models: ClimateModel[] = [];
  public scenario = DEFAULT_SCENARIO;
  public unit: string;

  constructor() {}

  ngOnInit() {
    this.unit = this.indicator.default_units;
  }

  modelsChanged(models: ClimateModel[]) {
    this.models = models;
  }

  scenarioSelected(scenario: Scenario) {
    this.scenario = scenario;
  }

  unitSelected(unit: string) {
    this.unit = unit;
  }

  datasetSelected(dataset: Dataset) {
    this.dataset = dataset;
  }
}
