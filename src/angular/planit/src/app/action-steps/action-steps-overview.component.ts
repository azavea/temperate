import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import { ActionService } from '../core/services/action.service';
import { RiskService } from '../core/services/risk.service';
import { WeatherEventService } from '../core/services/weather-event.service';
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
               private weatherEventService: WeatherEventService,
               private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap.switchMap((params: ParamMap) => {
      return this.riskService.filterByWeatherEvent(+params.get('hazard') || null);
    }).subscribe(risks => this.risks = risks);
    this.route.queryParamMap.switchMap((params: ParamMap) => {
      const weatherEventId = +params.get('hazard') || undefined;
      if (Number.isInteger(weatherEventId)) {
        return this.weatherEventService.get(weatherEventId);
      } else {
        return Observable.of(undefined);
      }
    }).subscribe(weatherEvent => this.weatherEvent = weatherEvent);
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
