import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable } from 'rxjs/Rx';

import { Indicator, IndicatorService } from 'climate-change-components';

import { environment } from '../../../environments/environment';
import { Action } from '../../shared/models/action.model';
import { Risk } from '../../shared/models/risk.model';
import { WeatherEvent } from '../../shared/models/weather-event.model';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class RiskService {

  constructor(private apiHttp: PlanItApiHttp,
              private indicatorService: IndicatorService) {}

  private formatRisk(risk: Risk) {
    // Django expects pk's for related objects whereas the front end wants the full objs
    const formattedRisk = cloneDeep(risk);
    return Object.assign(formattedRisk, { weather_event: formattedRisk.weather_event.id,
                         community_system: formattedRisk.community_system.id });
  }

  list(): Observable<Risk[]> {
    const url = `${environment.apiUrl}/api/risks/`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(r => new Risk(r));
    });
  }

  listWithAction(): Observable<Risk[]> {
    const url = `${environment.apiUrl}/api/risks-with-actions/`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(r => {
        const action = r.action ? new Action(r.action) : null;
        const risk = new Risk(r);
        risk.actionObject = action;
        return risk;
      });
    });
  }

  groupByWeatherEvent(): Observable<Map<string, Risk[]>> {
    return this.listWithAction().map(risks => {
      return risks.reduce((acc, r) => {
        const key = r.weather_event.name;
        if (!acc.has(key)) {
          acc.set(key, []);
        }
        acc.get(key).push(r);
        return acc;
      }, new Map<string, Risk[]>());
    });
  }

  get(id: string): Observable<Risk> {
   const url = `${environment.apiUrl}/api/risks/${id}/`;
   return this.apiHttp.get(url).map(resp => {
     return new Risk(resp.json());
   });
  }

  // This lives here since the IndicatorService lives in components and cannot be modified
  getRiskIndicators(risk: Risk) {
    return this.indicatorService.list().map(indicators => {
      return indicators.filter(i => risk.weather_event.indicators.includes(i.name));
    });
  }

  create(risk: Risk): Observable<Risk> {
    const url = `${environment.apiUrl}/api/risks/`;
    return this.apiHttp.post(url, this.formatRisk(risk)).map(resp => {
      return new Risk(resp.json());
    });
  }

  update(risk: Risk): Observable<Risk> {
    const url = `${environment.apiUrl}/api/risks/${risk.id}/`;
    return this.apiHttp.put(url, this.formatRisk(risk)).map(resp => {
      return new Risk(resp.json());
    });
  }

  delete(risk: Risk) {
    const url = `${environment.apiUrl}/api/risks/${risk.id}/`;
    return this.apiHttp.delete(url);
  }
}
