import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { IndicatorService } from '../../climate-api';
import { Action } from '../../shared/models/action.model';
import { Risk } from '../../shared/models/risk.model';
import { UserService } from './user.service';

@Injectable()
export class RiskService {
  static groupByWeatherEvent(risks: Risk[]) {
    return risks.reduce((acc, r) => {
      const key = r.weather_event.name;
      if (!acc.has(key)) {
        acc.set(key, []);
      }
      acc.get(key).push(r);
      return acc;
    }, new Map<string, Risk[]>());
  }

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private indicatorService: IndicatorService
  ) {}

  private formatRisk(risk: Risk) {
    const formattedRisk = cloneDeep(risk);
    delete formattedRisk.organization_weather_event;

    return Object.assign(formattedRisk, {
      action: formattedRisk.action ? formattedRisk.action : null,
      weather_event: formattedRisk.weather_event.id,
      community_system: formattedRisk.community_system.id,
      // Django expects empty strings, not null for choice fields
      impact_magnitude: formattedRisk.impact_magnitude ? formattedRisk.impact_magnitude : '',
      adaptive_capacity: formattedRisk.adaptive_capacity ? formattedRisk.adaptive_capacity : '',
    });
  }

  list(): Observable<Risk[]> {
    const url = `${environment.apiUrl}/api/risks/`;
    return this.http.get<any[]>(url).pipe(
      map(resp => {
        const vals = resp || [];
        const risks: Risk[] = vals.map(r => {
          r.action = r.action ? new Action(r.action) : null;
          return new Risk(r);
        });
        risks.sort((a: Risk, b: Risk) => a.compare(b));
        return risks;
      })
    );
  }

  filterByWeatherEvent(weatherEventId?: number) {
    return this.list().pipe(
      map(risks => {
        if (typeof weatherEventId === 'number') {
          return risks.filter(r => r.weather_event.id === weatherEventId);
        } else {
          return risks;
        }
      })
    );
  }

  groupByWeatherEvent(): Observable<Map<string, Risk[]>> {
    return this.list().pipe(map(risks => RiskService.groupByWeatherEvent(risks)));
  }

  get(id: string): Observable<Risk> {
    const url = `${environment.apiUrl}/api/risks/${id}/`;
    return this.http.get(url).pipe(
      map(resp => {
        return new Risk(resp);
      })
    );
  }

  // This lives here since the IndicatorService lives in components and cannot be modified
  getRiskIndicators(risk: Risk) {
    return this.indicatorService.list().pipe(
      map(indicators => {
        return indicators.filter(i => risk.weather_event.indicators.includes(i.name));
      })
    );
  }

  create(risk: Risk): Observable<Risk> {
    const url = `${environment.apiUrl}/api/risks/`;
    return this.http.post(url, this.formatRisk(risk)).pipe(
      map(resp => {
        // Creating a risk can add a new weather event for the user's organization, so we need to
        // invalidate our cached version to refresh.
        this.userService.invalidate();
        return new Risk(resp);
      })
    );
  }

  update(risk: Risk): Observable<Risk> {
    const url = `${environment.apiUrl}/api/risks/${risk.id}/`;
    return this.http.patch(url, this.formatRisk(risk)).pipe(
      map(resp => {
        // Updating a risk can change the weather events for the user's organization, so we need to
        // invalidate our cached version to refresh.
        this.userService.invalidate();
        return new Risk(resp);
      })
    );
  }

  delete(risk: Risk) {
    const url = `${environment.apiUrl}/api/risks/${risk.id}/`;
    return this.http.delete(url).pipe(
      map(resp => {
        // Deleting a risk can remove a new weather event from the user's organization, so we need
        // to invalidate our cached version to refresh.
        this.userService.invalidate();
        return resp;
      })
    );
  }

  deleteMany(risks: Risk[]) {
    return forkJoin(risks.map(risk => {
      const url = `${environment.apiUrl}/api/risks/${risk.id}/`;
      return this.http.delete(url);
    }))
    .pipe(tap(() => {
      // Deleting a risk can remove a new weather event from the user's organization, so we need to
      // invalidate our cached version to refresh.
      this.userService.invalidate();
    }));
  }
}
