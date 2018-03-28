import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import {
  Chart,
  ChartData,
  ChartService,
  City,
  ClimateModel,
  Dataset,
  Indicator,
  IndicatorQueryParams,
  IndicatorRequestOpts,
  IndicatorService,
  Scenario,
  TimeAggParam
} from 'climate-change-components';

import { environment } from '../../../environments/environment';

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

  @Output() extraParamsChanged = new EventEmitter<IndicatorQueryParams>();

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
  private firstYear = 2015;
  private lastYear = 2030;
  private historicalScenario: Scenario = {
    name: 'historical',
    label: 'Historical',
    description: ''
  };
  public dateRange: number[] = [this.firstYear, this.lastYear];
  public requestErrorCount = 0;
  public error: any;
  public supportEmail = environment.supportEmail;
  public maskSlider = true;

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
    const future = this.indicatorService.getData(queryOpts);

    queryOpts.scenario = this.historicalScenario;
    const historical = this.indicatorService.getData(queryOpts);

    this.dataSubscription = Observable.forkJoin(
      historical,
      future
    ).subscribe(data => {
      this.rawChartData = data;
      this.processedData = this.chartService.convertChartData(data);
      if (this.processedData[0]) {
        this.sliceChartData(this.dateRange);
      }
    }, error => {
      this.requestErrorCount += 1;
      this.error = error;
    });
  }

  retryDataLoad() {
    // clear errors only on retry
    this.error = undefined;
    this.updateChart(this.extraParams);
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
    this.extraParamsChanged.emit(this.extraParams);
    this.updateChart(this.extraParams);
  }

  private cancelDataRequest() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
