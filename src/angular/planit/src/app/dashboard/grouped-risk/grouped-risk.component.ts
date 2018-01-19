import { Component, Input, OnChanges } from '@angular/core';
import { Risk, WeatherEvent } from '../../shared/';

@Component({
  selector: 'app-grouped-risk',
  templateUrl: 'grouped-risk.component.html'
})

export class GroupedRiskComponent implements OnChanges {

  @Input() risks: Risk[];
  @Input() weatherEvent: WeatherEvent;

  constructor() { }

  ngOnChanges() {

  }

  numberAssessed() {
    return this.risks.reduce((acc, risk) => {
      const assessed = risk.isAssessed() ? 1 : 0;
      return acc + assessed;
    }, 0);
  }

  percentAssessed() {
    return Math.floor(this.numberAssessed() / this.risks.length * 100);
  }
}
