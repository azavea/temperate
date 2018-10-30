import { Component, Input, ViewChildren } from '@angular/core';

import { Indicator } from 'climate-change-components';

import { CollapsibleChartComponent } from '../collapsible-chart/collapsible-chart.component';
import { Point } from '../geojson';

@Component({
  selector: 'app-force-collapse-chart-container',
  templateUrl: './force-collapse-chart-container.component.html'
})
export class ForceCollapseChartContainerComponent {

  @Input() point: Point;
  @Input() indicators: Indicator[] = [];

  @ViewChildren(CollapsibleChartComponent)
  private charts: CollapsibleChartComponent[] = [];

  constructor() {}

  public chartToggled(indicatorName: string, isOpen: boolean) {
    this.charts.forEach(chart => {
      if (chart.indicator.name !== indicatorName && chart.isOpen) {
        chart.isOpen = false;
      }
    });
  }
}
