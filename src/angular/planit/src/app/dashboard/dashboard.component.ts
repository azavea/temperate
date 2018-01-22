import { Component, OnInit, ViewChild } from '@angular/core';

import { RiskService } from '../core/services/risk.service';
import { Risk, WeatherEvent } from '../shared/';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public groupedRisks: any[];

  constructor(private riskService: RiskService) { }

  ngOnInit() {
    this.riskService.groupByWeatherEvent().subscribe(r => {
      this.groupedRisks = Array.from(r.values());
    });
  }
}
