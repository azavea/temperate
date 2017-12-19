import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Input() isOpen: boolean;
  @Input() city: City;
  @Output() toggled: EventEmitter<boolean> = new EventEmitter();

  public dataset: Dataset = DEFAULT_DATASET;
  public extraParams: IndicatorQueryParams;
  public models: ClimateModel[] = [];
  public scenario = DEFAULT_SCENARIO;
  public unit: string;

  ngOnInit() {
    this.unit = this.indicator.default_units;
    console.log('init', this.dataset, this.models);
  }

  chartToggled() {
    this.isOpen = !this.isOpen;
    this.toggled.emit(this.isOpen);
  }

  modelsChanged(models: ClimateModel[]) {
    console.log('models changed', models);
    window.setTimeout(() => this.models = models);
  }

  scenarioSelected(scenario: Scenario) {
    this.scenario = scenario;
  }

  unitSelected(unit: string) {
    this.unit = unit;
  }

  datasetSelected(dataset: Dataset) {
    console.log('dataset selected', dataset);
    this.dataset = dataset;
  }
}
