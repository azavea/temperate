import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-action-review-step',
  templateUrl: './review-step.component.html'
})
export class ReviewStepComponent implements OnInit {

  public navigationSymbol = '6';
  public title = 'Review';

  constructor() { }

  ngOnInit() {
  }

}
