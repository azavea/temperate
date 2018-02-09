import { Component, OnInit, ViewChild } from '@angular/core';

import { DownloadService } from '../core/services/download.service';
import { RiskService } from '../core/services/risk.service';
import { Risk, WeatherEvent } from '../shared/';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public groupedRisks: any[];

  constructor(private riskService: RiskService, private downloadService: DownloadService) { }

  ngOnInit() {
    this.riskService.groupByWeatherEvent().subscribe(r => {
      this.groupedRisks = Array.from(r.values());
    });
  }

  downloadPlan() {
    const url = `${environment.apiUrl}/api/export-plan/`;
    const filename = 'adaptation_plan';

    this.downloadService.downloadCSV(url, filename);
  }
}
