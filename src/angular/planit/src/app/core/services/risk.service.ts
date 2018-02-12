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
    const formattedRisk = cloneDeep(risk);
    return Object.assign(formattedRisk, {
      action: formattedRisk.action ? formattedRisk.action : null,
      weather_event: formattedRisk.weather_event.id,
      community_system: formattedRisk.community_system.id,
      // Django expects empty strings, not null for choice fields
      impact_magnitude: formattedRisk.impact_magnitude ? formattedRisk.impact_magnitude : '',
      adaptive_capacity: formattedRisk.adaptive_capacity ? formattedRisk.adaptive_capacity : '',
      frequency: formattedRisk.frequency ? formattedRisk.frequency : '',
      intensity: formattedRisk.intensity ? formattedRisk.intensity : '',
      probability: formattedRisk.probability ? formattedRisk.probability : '',
    });
  }

  list(): Observable<Risk[]> {
    const url = `${environment.apiUrl}/api/risks/`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(r => {
        r.action = r.action ? new Action(r.action) : null;
        return new Risk(r);
      });
    });
  }

  filterByWeatherEvent(weatherEventId?: number) {
    return this.list().map(risks => {
      if (typeof weatherEventId === 'number') {
        return risks.filter(r => r.weather_event.id === weatherEventId);
      } else {
        return risks;
      }
    });
  }

  groupByWeatherEvent(): Observable<Map<string, Risk[]>> {
    return this.list().map(risks => {
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
