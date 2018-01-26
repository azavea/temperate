import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { RiskService } from '../core/services/risk.service';
import { Risk } from '../shared';

@Component({
  selector: 'va-overview',
  templateUrl: 'assessment-overview.component.html'
})
export class AssessmentOverviewComponent implements OnInit {
  public risks: Risk[];

  constructor (private riskService: RiskService,
               private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap.switchMap((params: ParamMap) => {
      return this.getRisks(+params.get('hazard') || null);
    }).subscribe(risks => this.risks = risks);
  }

  getRisks(weatherEvent?: number) {
    return this.riskService.list().map(risks => {
      if (typeof weatherEvent === 'number') {
        return risks.filter(r => r.weather_event.id === weatherEvent);
      } else {
        return risks;
      }
    });
  }

  deleteRisk(risk: Risk) {
    this.riskService.delete(risk).subscribe(() => {
      this.risks = this.risks.filter(r => r.id !== risk.id);
    });
  }
}
