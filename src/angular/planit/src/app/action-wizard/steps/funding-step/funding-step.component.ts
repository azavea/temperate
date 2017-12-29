import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-action-funding-step',
  templateUrl: './funding-step.component.html'
})
export class FundingStepComponent implements OnInit {
  public navigationSymbol = '5';
  public title = 'Funding';

  constructor() { }

  ngOnInit() {
  }

}
