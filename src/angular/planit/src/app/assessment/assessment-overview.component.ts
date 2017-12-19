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
    this.risks = [{
      name: 'Heat on the elderly',
      hazard: 'heat',
      communitySystem: 'elderly',
      potentialImpact: 0,
      adaptiveCapacity: 2
    }, {
      name: 'Heat on asphalt',
      hazard: 'heat',
      communitySystem: 'asphalt',
      potentialImpact: 1,
      adaptiveCapacity: 1
    }, {
      name: 'Extreme cold days on agriculture',
      hazard: 'extreme_cold',
      communitySystem: 'agriculture',
      potentialImpact: 2,
      adaptiveCapacity: 0
    },
    {
      name: 'Water-bourne disease on ecological function',
      hazard: 'water_bourne_disease',
      communitySystem: 'ecological_function',
      potentialImpact: 2,
      adaptiveCapacity: 2
    }];
  }
}
