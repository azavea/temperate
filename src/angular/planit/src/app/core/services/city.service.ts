import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';

import { City as ApiCity } from 'climate-change-components';

import { PlanItApiHttp } from './api-http.service';
import { CacheService } from './cache.service';
import { UserService } from './user.service';

@Injectable()
export class CityService {

  constructor(private apiHttp: PlanItApiHttp, private cache: CacheService,
              private userService: UserService) {}

  search(query: string): Observable<ApiCity[]> {
    const url = `${environment.apiUrl}/api/climate-api/api/city/?search=${query}`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json().features || [];
      return vals;
    });
  }
}
