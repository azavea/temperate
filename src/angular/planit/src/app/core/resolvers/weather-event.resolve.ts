import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { Observable, of } from 'rxjs';

import { WeatherEventService } from '../../core/services/weather-event.service';
import { WeatherEvent } from '../../shared/';

@Injectable()
export class WeatherEventResolve implements Resolve<WeatherEvent> {

  constructor(private weatherEventService: WeatherEventService) { }

  resolve(route: ActivatedRouteSnapshot) {
    const hazardId = route.queryParamMap.get('hazard');
    if (typeof hazardId === 'string') {
      return this.weatherEventService.get(+hazardId);
    } else {
      return of(undefined);
    }
  }
}
