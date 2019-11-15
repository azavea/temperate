import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { ImpactService } from '../core/services/impact.service';
import { RiskService } from '../core/services/risk.service';
import { Action, Impact, Risk, WeatherEvent } from '../shared';
import { ImpactMapModalComponent } from '../shared/impact-map/impact-map-modal.component';

@Component({
  selector: 'va-overview',
  templateUrl: 'assessment-overview.component.html'
})
export class AssessmentOverviewComponent implements OnInit {

  @ViewChild('impactsMapModal', {static: true})
  private impactsMapModal: ImpactMapModalComponent;

  public mapImpact: Impact;
  public risks: Risk[];
  public impacts: Impact[] = [];
  public impactsShown = true;
  public weatherEvent?: WeatherEvent;

  constructor (private riskService: RiskService,
               private impactService: ImpactService,
               private route: ActivatedRoute,
               private router: Router) {}

  ngOnInit() {
    if (this.route.snapshot.data['weatherEvent']) {
      this.weatherEvent = this.route.snapshot.data['weatherEvent'] as WeatherEvent;
      this.riskService.filterByWeatherEvent(this.weatherEvent.id)
        .subscribe(risks => this.risks = risks);
      this.impactService.rankedFor(this.weatherEvent)
        .subscribe(impacts => this.impacts = impacts);
    } else {
      this.riskService.list().subscribe(risks => this.risks = risks);
    }
  }

  getAssessedRisks() {
    return this.risks.filter(r => r.isAssessed());
  }

  openMapModal(impact: Impact) {
    this.mapImpact = impact;
    this.impactsMapModal.show();
  }
}
