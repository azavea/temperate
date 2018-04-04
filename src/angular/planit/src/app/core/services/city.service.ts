import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';

import { City as ApiCity } from 'climate-change-components';

import { APICacheService } from 'climate-change-components';
import { CORE_CITYSERVICE_GET } from '../constants/cache';
import { PlanItApiHttp } from './api-http.service';
import { UserService } from './user.service';

@Injectable()
export class CityService {

  constructor(private apiHttp: PlanItApiHttp, private cache: APICacheService,
              private userService: UserService) {}

  get(id: string): Observable<ApiCity> {
    const url = `${environment.apiUrl}/api/climate-api/api/city/${id}/`;
    const request = this.apiHttp.get(url);
    const response = this.cache.get(CORE_CITYSERVICE_GET, request);

    return response.map((resp) => {
      const data = resp.json() as ApiCity;
      return data;
    });
  }

  search(query: string): Observable<ApiCity[]> {
    const url = `${environment.apiUrl}/api/climate-api/api/city/?search=${query}`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json().features || [];
      return vals;
    });
  }
}
