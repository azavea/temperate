import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

import {
  Chart,
  ChartData,
  City,
  ClimateModel,
  Dataset,
  Indicator,
  IndicatorQueryParams,
  IndicatorRequestOpts,
  ModelModalComponent,
  Scenario,
  isBasetempIndicator,
  isHistoricIndicator,
  isPercentileIndicator,
  isThresholdIndicator
} from 'climate-change-components';

import { UserService } from '../../core/services/user.service';
import {
  OrgUnitType,
  PrecipitationUnits,
  TemperatureUnits
} from '../../shared';

import {
  DEFAULT_DATASET,
  DEFAULT_SCENARIO
} from './indicator-defaults';

@Component({
  selector: 'app-indicator-chart',
  templateUrl: './indicator-chart.component.html'
})
export class IndicatorChartComponent implements OnInit {
  @Input() indicator: Indicator;
  @Input() city: City;

  public isThresholdIndicator = isThresholdIndicator;
  public isBasetempIndicator = isBasetempIndicator;
  public isHistoricIndicator = isHistoricIndicator;
  public isPercentileIndicator = isPercentileIndicator;

  public models: ClimateModel[] = [];
  public scenario = DEFAULT_SCENARIO;
  public dataset: Dataset = DEFAULT_DATASET;
  public extraParams: IndicatorQueryParams = {};
  public unit: string;

  public temperatureUnits = TemperatureUnits;
  public precipitationUnits = PrecipitationUnits;

  @ViewChild(ModelModalComponent)
  private modelModal: ModelModalComponent;
  private el: ElementRef;

  constructor(private userService: UserService, private elementRef: ElementRef) {}

  ngOnInit() {
    this.userService.current().subscribe(user => {
      this.unit = this.translateOrgUnits(user.primary_organization.units);
    });

    this.el = this.elementRef;
  }

  ngDoCheck() {
    const isParentModalVisible = this.el.nativeElement.offsetParent !== null;

    if (!isParentModalVisible) {
      this.modelModal.hide();
    }
  }

  translateOrgUnits(unit_type: OrgUnitType) {
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
