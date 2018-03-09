import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { OrgWeatherEvent, WeatherEvent } from '../../shared';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class WeatherEventService {

  constructor(private apiHttp: PlanItApiHttp) {}

  list(): Observable<WeatherEvent[]> {
    const url = `${environment.apiUrl}/api/weather-event/`;
    return this.apiHttp.get(url)
      .map(resp => resp.json() || [] as WeatherEvent[]);
  }

  get(weatherEventId: number): Observable<WeatherEvent> {
    const url = `${environment.apiUrl}/api/weather-event/${weatherEventId}`;
    return this.apiHttp.get(url)
      .map(resp => resp.json() as WeatherEvent);
  }

  listForCurrentOrg(): Observable<OrgWeatherEvent[]> {
    const url = `${environment.apiUrl}/api/organization-weather-event/`;
    return this.apiHttp.get(url)
      .map(resp => resp.json() || [] as OrgWeatherEvent[]);
  }

  rankedEvents(): Observable<WeatherEvent[]> {
    return this.listForCurrentOrg().map(events => {
      return events.map(e => e.weather_event as WeatherEvent);
    });
  }
}
