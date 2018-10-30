import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';

import { City as ApiCity } from 'climate-change-components';

import { APICacheService } from 'climate-change-components';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class CityService {

  constructor(private apiHttp: PlanItApiHttp, private cache: APICacheService) {}

  search(query: string): Observable<ApiCity[]> {
    const url = `${environment.apiUrl}/api/climate-api/api/city/?search=${query}`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json().features || [];
      return vals;
    });
  }
}
