import { Location } from '@angular/common';
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
  public tooltipText = {
    adaptiveCapacity: 'The ability to respond to change, deal with potential damage, and take ' +
                      'advantage of opportunities. It relates to built, natural, and social ' +
                      'systems, as well as institutions, humans, and other organisms. Systems ' +
                      'with High Adaptive Capacity are better able to cope with climate change ' +
                      'impacts.',
    potentialImpact: 'The degree to which the risk will affect the city overall.',
    risk: 'A potential future climate hazard and the social, civic, economic, or ecological ' +
          'system that may be affected.'
  };

  constructor (private riskService: RiskService,
               private actionService: ActionService,
               private location: Location,
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
      this.router.navigate(['action/new', risk.id],
                           {relativeTo: this.route, skipLocationChange: true});
      // change URL to wizard path without risk ID and push to browser history
      this.location.go('/actions/action/new/');
    }
  }
}
