import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-action-review-step',
  templateUrl: './review-step.component.html'
})
export class ReviewStepComponent implements OnInit {

  public navigationSymbol = '6';
  public title = 'Review';

  constructor(private router: Router) { }

  ngOnInit() {
  }

  finish() {
    this.router.navigate(['actions']);
  }
}
