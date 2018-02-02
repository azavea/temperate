import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { ActionService } from '../core/services/action.service';
import { RiskService } from '../core/services/risk.service';
import { Action, Risk } from '../shared';

@Component({
  selector: 'va-overview',
  templateUrl: 'assessment-overview.component.html'
})
export class AssessmentOverviewComponent implements OnInit {
  public risks: Risk[];

  constructor (private riskService: RiskService,
               private actionService: ActionService,
               private route: ActivatedRoute,
               private router: Router) {}

  ngOnInit() {
    this.route.queryParamMap.switchMap((params: ParamMap) => {
      return this.riskService.filterByWeatherEvent(+params.get('hazard') || null);
    }).subscribe(risks => this.risks = risks);
  }

  deleteRisk(risk: Risk) {
    this.riskService.delete(risk).subscribe(() => {
      this.risks = this.risks.filter(r => r.id !== risk.id);
    });
  }

  takeAction(risk: Risk) {
    if (risk.action && risk.action.id) {
      this.router.navigate(['actions/action/', risk.action.id]);
    } else {
      if (!risk.action) {
        risk.action = new Action({
          risk: risk.id
        });
      }
      this.actionService.create(risk.action).subscribe(a => {
        this.router.navigate(['actions/action/', a.id]);
      });
    }
  }
}
