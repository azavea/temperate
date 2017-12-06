
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'va-risk-step-hazard',
  templateUrl: 'hazard-step.component.html'
})

export class HazardStepComponent implements OnInit {

  public navigationSymbol = '2';
  public title = 'Hazard';

  constructor() { }

  ngOnInit() { }
}
