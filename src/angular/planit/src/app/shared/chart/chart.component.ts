import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import * as cloneDeep from 'lodash.clonedeep';
import { Observable, Subscription, forkJoin } from 'rxjs';

import {
  ChartData,
  ChartService,
  ClimateModel,
  DataExportService,
  Dataset,
  ImageExportService,
  Indicator,
  IndicatorDistanceQueryParams,
  IndicatorQueryParams,
  IndicatorRequestOpts,
  IndicatorService,
  Scenario,
  TimeAggParam,
} from '../../climate-api';

import { environment } from '../../../environments/environment';
import { Point } from '../geojson';

/*
 * Chart component
 * Container for each individual chart
 */
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  providers: [
    DataExportService,
    ImageExportService
  ]
})
export class ChartComponent implements OnChanges, OnDestroy, OnInit {

  @Output() extraParamsChanged = new EventEmitter<IndicatorQueryParams>();

  @Input() indicator: Indicator;
  @Input() dataset: Dataset;
  @Input() scenario: Scenario;
  @Input() models: ClimateModel[];
  @Input() point: Point;
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
              private dataExportService: DataExportService,
              private imageExportService: ImageExportService,
              private indicatorService: IndicatorService) {}

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

    const params: IndicatorDistanceQueryParams = {
      climateModels: this.models.filter(model => model.enabled),
      dataset: this.dataset.name,
      unit: this.unit,
      time_aggregation: TimeAggParam.Yearly,
      distance: environment.apiDistance
    };

    Object.assign(params, this.extraParams);

    const queryOpts: IndicatorRequestOpts = {
      indicator: this.indicator,
      scenario: this.scenario,
      params: params
    };

    this.dateRange = [this.firstYear, this.lastYear]; // reset time slider range
    const future = this.indicatorService.getDataForLatLon(this.point, queryOpts);

    queryOpts.scenario = this.historicalScenario;
    const historical = this.indicatorService.getDataForLatLon(this.point, queryOpts);

    this.dataSubscription = forkJoin(
      historical,
      future
    ).subscribe(data => {
      this.rawChartData = data;
      this.processedData = this.chartService.convertChartData(data);
      if (this.processedData[0]) {
        this.sliceChartData();
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

  sliceChartData(newRange?: number[]) {
    this.chartData = cloneDeep(this.processedData); // to trigger change detection
    if (newRange) {
      this.dateRange = newRange;
    }
    const startYear = this.dateRange[0];
    const endYear = this.dateRange[1];
    this.chartData[0]['data'] = this.chartData[0]['data'].filter(obj => {
      const year = obj['date'].getFullYear();
      return year >= startYear && year <= endYear;
    });
  }

  onDownloadImageClicked() {
    const fileName: string = [
      this.indicator.name,
      this.dataset.name,
      this.scenario.name
    ].join('_');
    this.imageExportService.downloadAsPNG(this.indicator.name, fileName, 'app-chart');
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

  public expandYearRange() {
    this.dateRange[1] = 2100;
    this.maskSlider = false;
    this.sliceChartData();
  }
}
