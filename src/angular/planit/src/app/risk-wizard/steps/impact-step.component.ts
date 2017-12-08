import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-risk-step-impact',
  templateUrl: 'impact-step.component.html'
})

export class ImpactStepComponent implements OnInit {

  public navigationSymbol = '3';
  public title = 'Impact';

  constructor() { }

  ngOnInit() { }
}
