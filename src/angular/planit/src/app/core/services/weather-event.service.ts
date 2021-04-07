import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { APICacheService } from '../../climate-api';
import { OrgWeatherEvent, WeatherEvent } from '../../shared';
import { CORE_WEATHEREVENTSERVICE_LIST } from '../constants/cache';

@Injectable()
export class WeatherEventService {
  private _currentOrgWeatherEvents = new Subject<OrgWeatherEvent[]>();

  constructor(private http: HttpClient, private cache: APICacheService) {}

  list(): Observable<WeatherEvent[]> {
    const url = `${environment.apiUrl}/api/weather-event/`;
    const request = this.http.get<WeatherEvent[]>(url);
    return this.cache.get(CORE_WEATHEREVENTSERVICE_LIST, request);
  }

  listForCurrentOrg(): Observable<OrgWeatherEvent[]> {
    const url = `${environment.apiUrl}/api/organization-weather-event/`;
    const response = this.http.get<OrgWeatherEvent[]>(url);
    response.subscribe(orgEvents => {
      this._currentOrgWeatherEvents.next(orgEvents);
    });
    return this._currentOrgWeatherEvents.asObservable();
  }

  get(weatherEventId: number): Observable<WeatherEvent> {
    const url = `${environment.apiUrl}/api/weather-event/${weatherEventId}/`;
    return this.http.get<WeatherEvent>(url);
  }

  rankedEvents(): Observable<WeatherEvent[]> {
    return this.listForCurrentOrg().pipe(
      map(events => {
        return events.map(e => e.weather_event as WeatherEvent);
      })
    );
  }

  invalidate() {
    this.cache.clear(CORE_WEATHEREVENTSERVICE_LIST);
    // Trigger requery and internal push to subject
    this.listForCurrentOrg().subscribe(() => undefined);
  }

  update(orgWeatherEvent: OrgWeatherEvent): Observable<OrgWeatherEvent> {
    const url = `${environment.apiUrl}/api/organization-weather-event/${orgWeatherEvent.id}/`;
    return this.http
      .patch<OrgWeatherEvent>(url, this.formatOrgWeatherEvent(orgWeatherEvent))
      .pipe(tap(() => this.invalidate()));
  }

  private formatOrgWeatherEvent(orgWeatherEvent: OrgWeatherEvent) {
    const formattedEvent = cloneDeep(orgWeatherEvent);
    return Object.assign(formattedEvent, {
      weather_event: formattedEvent.weather_event.id,
      // Django expects empty strings, not null for choice fields
      probability: formattedEvent.probability ? formattedEvent.probability : '',
      frequency: formattedEvent.frequency ? formattedEvent.frequency : '',
      intensity: formattedEvent.intensity ? formattedEvent.intensity : '',
    });
  }
}
