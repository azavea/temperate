import { Component, Input } from '@angular/core';
import { IndicatorChartComponent } from './indicator-chart/indicator-chart.component';

import { City,
         Indicator } from 'climate-change-components';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html'
})
export class IndicatorsComponent {

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
      name: 'average_high_temperature',
      label: 'Average High Temperature',
      // tslint:disable-next-line:max-line-length
      description: 'Average high temperature, calculated by averaging daily high temperatures over the year.',
      time_aggregation: 'yearly',
      variables: ['tasmax'],
      default_units: 'F'
    }, {
      name: 'heat_wave_incidents',
      label: 'Heat Wave Incidents',
      // tslint:disable-next-line:max-line-length
      description: 'Number of times daily high temperature exceeds 5C above historic norm for at least 5 consecutive days',
      time_aggregation: 'yearly',
      variables: ['tasmax'],
      default_units: 'count'
    }];
  }
}
