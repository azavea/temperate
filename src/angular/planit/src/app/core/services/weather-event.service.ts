import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { APICacheService } from '../../climate-api';
import { OrgWeatherEvent, WeatherEvent } from '../../shared';
import { CORE_WEATHEREVENTSERVICE_LIST } from '../constants/cache';

@Injectable()
export class WeatherEventService {

  constructor(private http: HttpClient,
              private cache: APICacheService) { }

  list(): Observable<WeatherEvent[]> {
    const url = `${environment.apiUrl}/api/weather-event/`;
    const request = this.http.get<WeatherEvent[]>(url);
    return this.cache.get(CORE_WEATHEREVENTSERVICE_LIST, request);
  }

  get(weatherEventId: number): Observable<WeatherEvent> {
    const url = `${environment.apiUrl}/api/weather-event/${weatherEventId}/`;
    return this.http.get<WeatherEvent>(url);
  }

  listForCurrentOrg(): Observable<OrgWeatherEvent[]> {
    const url = `${environment.apiUrl}/api/organization-weather-event/`;
    return this.http.get<OrgWeatherEvent[]>(url);
  }

  rankedEvents(): Observable<WeatherEvent[]> {
    return this.listForCurrentOrg().pipe(map(events => {
      return events.map(e => e.weather_event as WeatherEvent);
    }));
  }
}
