import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
export class IndicatorsComponent implements OnInit {

  public allIndicators: any[];


  constructor() {

    // test copy for accordion of collapsible cards of all indicators
    this.allIndicators = [{
      name: 'Heat Wave Incidents',
      isCollapsed: true,
      text: 'Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.',
    }, {
      name: 'Raining Spagetti Meatballs',
      isCollapsed: true,
      text: 'This is Thing Two'
    }];
  }

  ngOnInit() {
  }

  public addTopConcern(concern: any):void {
    console.log(concern);
  }

  public collapsed(event: any):void {
    console.log(event);
  }

  public expanded(event: any):void {
    console.log(event);
  }

}
