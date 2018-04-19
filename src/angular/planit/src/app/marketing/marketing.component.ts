import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AlertModule } from 'ngx-bootstrap';

@Component({
  selector: 'app-marketing',
  templateUrl: './marketing.component.html',
  styleUrls: []
})
export class MarketingComponent implements OnInit {

  public showDownloadMessage = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => this.showDownloadMessage = params.expired);
  }
}
