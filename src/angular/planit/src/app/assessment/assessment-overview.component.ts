import { Component, OnInit } from '@angular/core';

import { Risk } from '../shared';

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
      impactDescription: 'heat',
      communitySystem: {'name': 'elderly'},
      impactMagnitude: "0",
      adaptiveCapacity: "2"
    }, {
      name: 'Heat on asphalt',
      impactDescription: 'heat',
      communitySystem: {'name': 'asphalt'},
      impactMagnitude: "1",
      adaptiveCapacity: "1"
    }, {
      name: 'Extreme cold days on agriculture',
      impactDescription: 'extreme_cold',
      communitySystem: {'name': 'agriculture'},
      impactMagnitude: "2",
      adaptiveCapacity: "0"
    },
    {
      name: 'Water-bourne disease on ecological function',
      impactDescription: 'water_bourne_disease',
      communitySystem: {'name': 'ecological_function'},
      impactMagnitude: "2",
      adaptiveCapacity: "2"
    }];
  }
}
