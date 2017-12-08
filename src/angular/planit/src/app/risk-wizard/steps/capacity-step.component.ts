import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-risk-step-capacity',
  templateUrl: 'capacity-step.component.html'
})

export class CapacityStepComponent implements OnInit {

  public navigationSymbol = '4';
  public title = 'Adaptive capacity';

  constructor() { }

  ngOnInit() { }
}
