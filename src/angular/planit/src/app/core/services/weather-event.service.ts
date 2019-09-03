import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { APICacheService } from '../../climate-api';
import { OrgWeatherEvent, WeatherEvent } from '../../shared';
import { CORE_WEATHEREVENTSERVICE_LIST } from '../constants/cache';

@Injectable()
export class WeatherEventService {

  private _currentWeatherEvents = new Subject<WeatherEvent[]>();
  private _currentOrgWeatherEvents = new Subject<OrgWeatherEvent[]>();

  constructor(private http: HttpClient,
              private cache: APICacheService) { }

  list(): Observable<WeatherEvent[]> {
    const url = `${environment.apiUrl}/api/weather-event/`;
    const request = this.http.get<WeatherEvent[]>(url);
    const response = this.cache.get(CORE_WEATHEREVENTSERVICE_LIST, request);
    response.subscribe(events => {
      this._currentWeatherEvents.next(events);
    });
    return this._currentWeatherEvents.asObservable();
  }

  get(weatherEventId: number): Observable<WeatherEvent> {
    const url = `${environment.apiUrl}/api/weather-event/${weatherEventId}/`;
    return this.http.get<WeatherEvent>(url);
  }

  rankedEvents(): Observable<WeatherEvent[]> {
    return this.listForCurrentOrg().pipe(map(events => {
      return events.map(e => e.weather_event as WeatherEvent);
    }));
  }

  invalidate() {
    this.cache.clear(CORE_WEATHEREVENTSERVICE_LIST);
    // Trigger requery and internal push to subjects in list() and
    // listForCurrentOrg() calls
    this.list().subscribe(() => undefined);
    this.listForCurrentOrg().subscribe(() => undefined);
  }

  private listForCurrentOrg(): Observable<OrgWeatherEvent[]> {
    const url = `${environment.apiUrl}/api/organization-weather-event/`;
    const response = this.http.get<OrgWeatherEvent[]>(url);
    response.subscribe(orgEvents => {
      this._currentOrgWeatherEvents.next(orgEvents);
    });
    return this._currentOrgWeatherEvents.asObservable();
  }
}
