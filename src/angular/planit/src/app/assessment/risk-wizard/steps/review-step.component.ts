import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'va-risk-step-review',
  templateUrl: 'review-step.component.html'
})

export class ReviewStepComponent implements OnInit {

  public navigationSymbol = '5';
  public title = 'Review';

  constructor(private router: Router) { }

  ngOnInit() { }

  finish() {
    this.router.navigate(['assessment']);
  }
}
