import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  Output
} from '@angular/core';

import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Chart, ChartData, City, ClimateModel, Dataset, IndicatorRequestOpts,
  IndicatorQueryParams, Scenario, TimeAggParam, Indicator } from 'climate-change-components';

import { ChartService, IndicatorService } from 'climate-change-components';

import { isBasetempIndicator,
  isHistoricIndicator,
  isPercentileIndicator,
  isThresholdIndicator } from 'climate-change-components';

import * as cloneDeep from 'lodash.clonedeep';

/*
 * Chart component
 * Container for each individual chart
 */
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html'
})
export class ChartComponent implements OnChanges, OnDestroy, OnInit {

  @Output() onExtraParamsChanged = new EventEmitter<IndicatorQueryParams>();

  @Input() indicator: Indicator;
  @Input() dataset: Dataset;
  @Input() scenario: Scenario;
  @Input() models: ClimateModel[];
  @Input() city: City;
  @Input() unit: string;
  @Input() extraParams: IndicatorQueryParams;

  private processedData: ChartData[];
  public chartData: ChartData[];
  public rawChartData: any;
  public isHover: Boolean = false;
  private firstYear = 1950;
  private lastYear = 2100;
  private historicalScenario: Scenario = {
    name: 'historical',
    label: 'Historical',
    description: ''
  };
  public dateRange: number[] = [this.firstYear, this.lastYear];
  public isThresholdIndicator = isThresholdIndicator;
  public isBasetempIndicator = isBasetempIndicator;
  public isHistoricIndicator = isHistoricIndicator;
  public isPercentileIndicator = isPercentileIndicator;
  public noChartMessage = 'Loading...';

  public sliderConfig: any = {
    behaviour: 'drag',
    connect: true,
    margin: 1,
    step: 1,
    limit: 150,
    range: {
      min: 1950,
      max: 2100
    },
    pips: {
      mode: 'count',
      values: 6,
      density: 6
    }
  };
  private dataSubscription: Subscription;

  constructor(private chartService: ChartService,
              private indicatorService: IndicatorService,
              private changeDetector: ChangeDetectorRef) {
  }

  // Mousemove event must be at this level to listen to mousing over rect#overlay
  @HostListener('mouseover', ['$event'])
  onMouseOver(event) {
    this.isHover = event.target.id === 'overlay' ? true : false;
  }

  ngOnInit() {
    this.updateChart(this.extraParams);
  }

  ngOnChanges($event) {
    this.updateChart($event);
  }

  ngOnDestroy() {
    this.cancelDataRequest();
  }

  updateChart(extraParams: IndicatorQueryParams) {
    this.cancelDataRequest();
    this.noChartMessage = 'Loading...';
    this.chartData = [];
    this.rawChartData = [];

    const params: IndicatorQueryParams = {
      climateModels: this.models.filter(model => model.enabled),
      dataset: this.dataset.name,
      unit: this.unit,
      time_aggregation: TimeAggParam.Yearly
    };

    Object.assign(params, this.extraParams);

    const queryOpts: IndicatorRequestOpts = {
      indicator: this.indicator,
      scenario: this.scenario,
      city: this.city,
      params: params
    };

    this.dateRange = [this.firstYear, this.lastYear]; // reset time slider range
    const future = this.indicatorService.getData(queryOpts).catch(error => {
      console.error('future data query error:');
      this.handleChartApiError(error);
      return Observable.throw(error);
    });

    queryOpts.scenario = this.historicalScenario;
    const historical = this.indicatorService.getData(queryOpts).catch(error => {
      console.error('historical data query error:');
      this.handleChartApiError(error);
      return Observable.throw(error);
    });

    this.dataSubscription = Observable.forkJoin(
      historical,
      future
    ).subscribe(data => {
      this.rawChartData = data;
      this.processedData = this.chartService.convertChartData(data);
      this.chartData = cloneDeep(this.processedData);
    }, error => {
      console.error('data subscribe caught error:');
      console.error(error);
    });
  }

  sliceChartData(newRange: number[]) {
    this.chartData = cloneDeep(this.processedData); // to trigger change detection
    this.dateRange = newRange;
    const startYear = this.dateRange[0];
    const endYear = this.dateRange[1];
    this.chartData[0]['data'] = this.chartData[0]['data'].filter(obj => {
      const year = obj['date'].getFullYear();
      return year >= startYear && year <= endYear;
    });
  }

  public onExtraParamsSelected(params: IndicatorQueryParams) {
    this.extraParams = params;
    this.onExtraParamsChanged.emit(this.extraParams);
    this.updateChart(this.extraParams);
  }

  private cancelDataRequest() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  private handleChartApiError(error: Response) {
    console.error(error);
    // TODO: treat error as an array once this is fixed:
    // https://github.com/azavea/climate-change-api/issues/791
    const errorJson = error ? error.json() : 'Unknown error querying Climate API';
    if (errorJson.error) {
      this.noChartMessage = errorJson.error;
    }
  }
}
