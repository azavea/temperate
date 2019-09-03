import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Indicator } from '../../climate-api';
import { Location } from '../models/location.model';

@Component({
  selector: 'app-collapsible-chart',
  templateUrl: './collapsible-chart.component.html'
})
export class CollapsibleChartComponent {

  @Input() isOpen: boolean;
  @Input() indicator: Indicator;
  @Input() location: Location;
  @Output() toggled: EventEmitter<boolean> = new EventEmitter();

  constructor() {}

  chartToggled() {
    this.isOpen = !this.isOpen;
    this.toggled.emit(this.isOpen);
  }
}
