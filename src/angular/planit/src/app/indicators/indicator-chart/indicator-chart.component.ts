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
  Scenario,
  isBasetempIndicator,
  isHistoricIndicator,
  isPercentileIndicator,
  isThresholdIndicator
} from 'climate-change-components';

import {
  DEFAULT_DATASET,
  DEFAULT_SCENARIO
} from '../indicator-defaults';

import { TEMPERATURE_UNITS,
         PRECIPITATION_UNITS,
         UNIT_TYPES } from '../../shared';
import { UserService } from '../../core/services/user.service';

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
  public extraParams: IndicatorQueryParams = {};
  public isThresholdIndicator = isThresholdIndicator;
  public isBasetempIndicator = isBasetempIndicator;
  public isHistoricIndicator = isHistoricIndicator;
  public isPercentileIndicator = isPercentileIndicator;
  public models: ClimateModel[] = [];
  public scenario = DEFAULT_SCENARIO;
  public unit: string;

  public temperatureUnits = TEMPERATURE_UNITS;
  public precipitationUnits = PRECIPITATION_UNITS;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.current().subscribe(user => {
      this.unit = this.translateOrgUnits(user.primaryOrganization.units);
    });
  }

  chartToggled() {
    this.isOpen = !this.isOpen;
    this.toggled.emit(this.isOpen);
  }

  translateOrgUnits(unit_type: UNIT_TYPES) {
    // Translate org unit type to actual indicator unit
    if (this.indicator.variables.indexOf('pr') >= 0) {
      return this.indicator.available_units.find(u => u === this.precipitationUnits[unit_type]) ||
              this.indicator.default_units;
    } else {
      return this.indicator.available_units.find(u => u === this.temperatureUnits[unit_type]) ||
              this.indicator.default_units;
    }
  }

  modelsChanged(models: ClimateModel[]) {
    window.setTimeout(() => this.models = models);
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

  onExtraParamsSelected(params: IndicatorQueryParams) {
    this.extraParams = Object.assign({}, params);
  }
}
