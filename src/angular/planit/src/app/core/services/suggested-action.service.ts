import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable } from 'rxjs/Rx';

import { CommunitySystem } from '../../shared/models/community-system.model';
import { environment } from '../../../environments/environment';
import { SuggestedAction } from '../../shared/models/suggested-action.model';
import { PlanItApiHttp } from './api-http.service';
import { WeatherEvent } from '../../shared/models/weather-event.model';

@Injectable()
export class SuggestedActionService {

  constructor(private apiHttp: PlanItApiHttp) {}
  list(weather_event: WeatherEvent, community_system: CommunitySystem): Observable<SuggestedAction[]> {
    const url = `${environment.apiUrl}/api/suggestions/`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(a => new SuggestedAction(a));
    });
  }
}
