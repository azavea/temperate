import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import { ActionService } from '../core/services/action.service';
import { RiskService } from '../core/services/risk.service';
import { Action, Risk, WeatherEvent } from '../shared';

@Component({
  selector: 'as-overview',
  templateUrl: 'action-steps-overview.component.html'
})

export class ActionStepsOverviewComponent implements OnInit {

  public action: Action;
  public risks: Risk[];
  public weatherEvent?: WeatherEvent;

  constructor (private actionService: ActionService,
               private riskService: RiskService,
               private route: ActivatedRoute) {}

  ngOnInit() {
    if (this.route.snapshot.data['weatherEvent']) {
      this.weatherEvent = this.route.snapshot.data['weatherEvent'] as WeatherEvent;
      this.riskService.filterByWeatherEvent(this.weatherEvent.id)
        .subscribe(risks => this.risks = risks);
    } else {
      this.riskService.list().subscribe(risks => this.risks = risks);
    }
  }

  // Check if any of the risks have been assessed yet
  get isARiskAssessed(): boolean {
    return !!this.risks.find((risk: Risk) => risk.isAssessed());
  }

  deleteAction(action) {
    this.actionService.delete(action).subscribe(a => {
      const risk = this.risks.find(r => r.action && r.action.id === action.id);
      risk.action = null;
    });
  }
}
