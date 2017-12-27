import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-action-improvements-step',
  templateUrl: './improvements-step.component.html'
})
export class ImprovementsStepComponent implements OnInit {

  public navigationSymbol = '3';
  public title = 'Improvements';

  constructor() { }

  ngOnInit() {
  }

}
