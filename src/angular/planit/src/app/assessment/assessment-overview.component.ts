import { Component, OnInit } from '@angular/core';

import { Risk } from '../shared/models/risk.model';

@Component({
  selector: 'va-overview',
  templateUrl: 'assessment-overview.component.html'
})
export class AssessmentOverviewComponent implements OnInit {
  public risks: Risk[];

  constructor () {}

  ngOnInit() {
    this.risks = [
      {name: 'Heat on the elderly', potentialImpact: 0, adaptiveCapacity: 2},
      {name: 'Heat on asphalt', potentialImpact: 1, adaptiveCapacity: 1},
      {name: 'Extreme cold days on agriculture', potentialImpact: 2, adaptiveCapacity: 0},
      {name: 'Water-bourne disease on ecological function', potentialImpact: 2,
        adaptiveCapacity: 2
      },
    ];
  }
}
