import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { OrgWeatherEvent, WeatherEvent } from '../../shared';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class WeatherEventService {

  constructor(private apiHttp: PlanItApiHttp) {}

  addToCurrentOrg(weatherEvent: WeatherEvent) {
    const url = `${environment.apiUrl}/api/organization-weather-event/`;
    return this.apiHttp.post(url, {weather_event: weatherEvent.id}).map(resp => {
      return resp.json() as OrgWeatherEvent;
    });
  }

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
    const url = `${environment.apiUrl}/api/weather-event-rank/`;
    return this.listForCurrentOrg().map(events => {
      return events.map(e => e.weather_event as WeatherEvent);
    });
  }

  removeFromCurrentOrg(weatherEvent: OrgWeatherEvent) {
    const url = `${environment.apiUrl}/api/organization-weather-event/${weatherEvent.id}`;
    return this.apiHttp.delete(url).map(response => weatherEvent.id);
  }
}
