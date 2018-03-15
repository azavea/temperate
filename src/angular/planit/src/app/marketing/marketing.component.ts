import { Component } from '@angular/core';


@Component({
  selector: 'app-marketing',
  templateUrl: './marketing.component.html',
  styleUrls: []
})
export class MarketingComponent {

  public hostname = window.location.hostname;

  constructor() {}
}
