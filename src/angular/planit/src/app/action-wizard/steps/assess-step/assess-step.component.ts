import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-action-assess-step',
  templateUrl: 'assess-step.component.html'
})
export class AssessStepComponent implements OnInit {

  public navigationSymbol = '1';
  public title = 'Assess';

  constructor() { }

  ngOnInit() {
  }
}
