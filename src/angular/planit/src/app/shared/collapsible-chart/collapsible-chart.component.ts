import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  City as ApiCity,
  Indicator
} from 'climate-change-components';

import { IndicatorChartComponent } from '../indicator-chart/indicator-chart.component';

@Component({
  selector: 'app-collapsible-chart',
  templateUrl: './collapsible-chart.component.html'
})
export class CollapsibleChartComponent {

  @Input() isOpen: boolean;
  @Input() indicator: Indicator;
  @Input() apiCity: ApiCity;
  @Output() toggled: EventEmitter<boolean> = new EventEmitter();

  constructor() {}

  chartToggled() {
    this.isOpen = !this.isOpen;
    this.toggled.emit(this.isOpen);
  }
}
