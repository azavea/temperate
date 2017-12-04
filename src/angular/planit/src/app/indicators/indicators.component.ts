import { Component, OnInit, Input } from '@angular/core';
import { IndicatorChartComponent } from './indicator-chart/indicator-chart.component';

import { City,
         Indicator } from 'climate-change-components';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: []
})
export class IndicatorsComponent implements OnInit {

  public allIndicators: Indicator[];

  public city: City;

  constructor() {
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

    this.allIndicators = [{
      name: 'heat_wave_incidents',
      label: 'Heat Wave Incidents',
      description: 'Number of times daily high temperature exceeds 5C above historic norm for at least 5 consecutive days',
      time_aggregation: 'yearly',
      variables: ['tasmax'],
      default_units: 'count'
    },{
      name: 'heat_wave_incidents',
      label: 'MeatBalls',
      description: 'Number of times daily high temperature exceeds 5C above historic norm for at least 5 consecutive days',
      time_aggregation: 'yearly',
      variables: ['tasmax'],
      default_units: 'count'
    }];
  }

  ngOnInit() {
  }

  public addTopConcern(concern: any) {
    console.log(concern);
  }
}
