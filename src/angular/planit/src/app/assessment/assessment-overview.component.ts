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
      hazard: 'heat',
      communitySystem: 'elderly',
      potentialImpact: 0,
      adaptiveCapacity: 2,
      indicators: [
        {name: 'Extreme Heat Events', url: '#'},
        {name: 'Heat Wave Incidents', url: '#'},
        {name: 'Heat Wave Duration Index', url: '#'}
      ]
    }, {
      name: 'Heat on asphalt',
      hazard: 'heat',
      communitySystem: 'asphalt',
      potentialImpact: 1,
      adaptiveCapacity: 1,
      indicators: [
        {name: 'Cooling Degree Days', url: '#'},
        {name: 'Heat Wave Incidents', url: '#'},
        {name: 'Heat Wave Duration Index', url: '#'}
      ]
    }, {
      name: 'Extreme cold days on agriculture',
      hazard: 'extreme_cold',
      communitySystem: 'agriculture',
      potentialImpact: 2,
      adaptiveCapacity: 0,
      indicators: [
        {name: 'Accumulated Freezing Degree Days', url: '#'},
        {name: 'Extreme Cold Events', url: '#'},
        {name: 'Frost Days', url: '#'},
      ]
    },
    {
      name: 'Water-bourne disease on ecological function',
      hazard: 'water_bourne_disease',
      communitySystem: 'ecological_function',
      potentialImpact: 2,
      adaptiveCapacity: 2,
      indicators: [
        {name: 'Total Precipitation', url: '#'},
        {name: 'Precipitation Threshold', url: '#'},
        {name: 'Extreme Precipitation Events', url: '#'},
      ]
    }];
  }
}
