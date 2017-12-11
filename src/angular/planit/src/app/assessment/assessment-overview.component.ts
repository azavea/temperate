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
      {'name': 'Heat on the elderly'},
      {'name': 'Heat on asphalt'},
      {'name': 'Extreme cold days on agriculture'},
      {'name': 'Water-bourne disease on ecological function'},
    ];
  }
}
