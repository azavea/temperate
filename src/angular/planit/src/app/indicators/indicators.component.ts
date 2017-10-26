import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
export class IndicatorsComponent implements OnInit {

  public isCollapsed: boolean;


  constructor() {
    this.isCollapsed = true;
  }

  ngOnInit() {
  }

  public collapsed(event:any):void {
    console.log(event);
  }

  public expanded(event:any):void {
    console.log(event);
  }

}
