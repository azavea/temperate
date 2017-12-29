import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-action-implementation-step',
  templateUrl: './implementation-step.component.html'
})
export class ImplementationStepComponent implements OnInit {

  public navigationSymbol = '2';
  public title = 'Implementation';

  constructor() { }

  ngOnInit() {
  }

}
