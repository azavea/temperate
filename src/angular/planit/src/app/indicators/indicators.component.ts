import { Component, Input, OnInit } from '@angular/core';
import { IndicatorChartComponent } from './indicator-chart/indicator-chart.component';

import { City,
         Indicator,
         IndicatorService } from 'climate-change-components';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html'
})
export class IndicatorsComponent implements OnInit {

  public allIndicators: Indicator[];
  public city: City;

  constructor(private indicatorService: IndicatorService) {}

  ngOnInit() {
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

    this.indicatorService.list().subscribe(data => this.allIndicators = data);
  }
}
