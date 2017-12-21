import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { WeatherEvent } from '../../shared';
import { PlanItApiHttp } from './api-http.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class WeatherEventService {

  constructor(private apiHttp: PlanItApiHttp) {}

  rankedEvents(): Observable<WeatherEvent[]> {
    const url = `${environment.apiUrl}/api/weather-event-rank/`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(e => e.weatherEvent as WeatherEvent);
    });
  }

}
