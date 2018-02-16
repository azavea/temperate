import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import { ActionService } from '../core/services/action.service';
import { RiskService } from '../core/services/risk.service';
import { WeatherEventService } from '../core/services/weather-event.service';
import { Action, Risk, WeatherEvent } from '../shared';

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
  public weatherEvent?: WeatherEvent;

  constructor (private riskService: RiskService,
               private actionService: ActionService,
               private weatherEventService: WeatherEventService,
               private route: ActivatedRoute,
               private router: Router) {}

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
