import { Component, OnInit, Input } from '@angular/core';
import { ChartData,
         Chart,
         IndicatorService,
         IndicatorRequestOpts,
         IndicatorQueryParams,
         Indicator,
         City,
         Dataset,
         Scenario } from 'climate-change-components';

import { Point } from 'geojson';

@Component({
  selector: 'indicator-chart',
  templateUrl: './indicator-chart.component.html',
  styleUrls: []
})
export class IndicatorChartComponent implements OnInit {

  @Input() indicator: Indicator;
  @Input() city: City;
  @Input() scenario: Scenario;
  @Input() dataset: Dataset
  @Input() extraParams: IndicatorQueryParams;

  public chartData: ChartData;

  constructor(private indicatorService: IndicatorService) {
  }

  ngOnInit() {
    let queryOpts: IndicatorRequestOpts = {
      indicator: this.indicator,
      city: this.city,
      scenario: this.scenario,
      params: this.extraParams
    };
    this.indicatorService.getData(queryOpts).subscribe(data => {
      this.chartData = data;
    });
  }

  public addTopConcern(concern: any) {
    console.log(concern);
  }

  public collapsed(event: any) {
    console.log(event);
  }

  public expanded(event: any) {
    console.log(event);
  }
}
