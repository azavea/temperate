import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { RiskService } from '../core/services/risk.service';
import { Action, Risk, WeatherEvent } from '../shared';

@Component({
  selector: 'va-overview',
  templateUrl: 'assessment-overview.component.html'
})
export class AssessmentOverviewComponent implements OnInit {

  public risks: Risk[];
  public weatherEvent?: WeatherEvent;

  constructor (private riskService: RiskService,
               private route: ActivatedRoute,
               private router: Router) {}

  ngOnInit() {
    if (this.route.snapshot.data['weatherEvent']) {
      this.weatherEvent = this.route.snapshot.data['weatherEvent'] as WeatherEvent;
      this.riskService.filterByWeatherEvent(this.weatherEvent.id)
        .subscribe(risks => this.risks = risks);
    } else {
      this.riskService.list().subscribe(risks => this.risks = risks);
    }
  }

  getAssessedRisks() {
    return this.risks.filter(r => r.isAssessed());
  }
}
