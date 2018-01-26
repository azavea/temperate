import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { ActionService } from '../core/services/action.service';
import { RiskService } from '../core/services/risk.service';
import { Action, Risk } from '../shared';

@Component({
  selector: 'as-overview',
  templateUrl: 'action-steps-overview.component.html'
})

export class ActionStepsOverviewComponent implements OnInit {

  public risks: Risk[];
  public actions: Action[];

  constructor (private actionService: ActionService,
               private riskService: RiskService,
               private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap.switchMap((params: ParamMap) => {
      return this.riskService.filterByWeatherEvent(+params.get('hazard') || null);
    }).subscribe(risks => this.risks = risks);
  }

  // Check if any of the risks have been assessed yet
  get isARiskAssessed(): boolean {
    return !!this.risks.find((risk: Risk) => risk.isAssessed());
  }

  // Refresh actions, risks and their counts when an action is deleted
  onActionDeleted(action) {
    this.actionService.delete(action).subscribe(a => {
      const risk = this.risks.find(r => r.action && r.action.id === action.id);
      risk.action = null;
    });
  }
}
