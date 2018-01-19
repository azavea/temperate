import { Component, OnInit } from '@angular/core';

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
      console.log(r.size, r);
      this.groupedRisks = Array.from(r.values());
    });
  }
}
