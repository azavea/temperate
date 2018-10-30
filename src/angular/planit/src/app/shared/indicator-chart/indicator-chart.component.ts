import {
  Component,
  DoCheck,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  ClimateModel,
  Dataset,
  Indicator,
  IndicatorQueryParams,
  ModelModalComponent,
  Scenario,
  isBasetempIndicator,
  isHistoricIndicator,
  isPercentileIndicator,
  isThresholdIndicator
} from 'climate-change-components';
import { Point } from '../geojson';

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
export class IndicatorChartComponent implements OnInit, DoCheck {
  @Input() indicator: Indicator;
  @Input() point: Point;

  public isThresholdIndicator = isThresholdIndicator;
  public isBasetempIndicator = isBasetempIndicator;
  public isHistoricIndicator = isHistoricIndicator;
  public isPercentileIndicator = isPercentileIndicator;

  // We've removed use of the City model in Temperate. However, the components dataset toggle takes
  //  a city object and will filter available datasets to what the city reports. Since the chart
  //  handles no data gracefully, we'll just disable this filtering here by always setting city to
  //  an empty object.
  public apiCity = {};
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
