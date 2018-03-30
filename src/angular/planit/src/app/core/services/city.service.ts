import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';

import { City as ApiCity } from 'climate-change-components';

import { City } from '../../shared';
import { PlanItApiHttp } from './api-http.service';
import { CacheService } from './cache.service';
import { UserService } from './user.service';

@Injectable()
export class CityService {

  constructor(private apiHttp: PlanItApiHttp, private cache: CacheService,
              private userService: UserService) {}

  current(): Observable<City | null> {
    let city: City = this.cache.get(CacheService.CORE_CITYSERVICE_CURRENT);
    if (city) {
      return Observable.of(city);
    }

    return Observable.create((observer) => {
      this.userService.current().subscribe(user => {
        const api_city_id = user.primary_organization.location.properties.api_city_id;
        const url = `${environment.apiUrl}/api/climate-api/api/city/${api_city_id}/`;
        this.apiHttp.get(url).subscribe(resp => {
          const json = resp.json();
          if (json) {
            city = new City(json);
            this.cache.set(CacheService.CORE_CITYSERVICE_CURRENT, city);
            observer.next(city);
            observer.complete();
          } else {
            observer.error(null);
          }
        },
        error => {
          observer.error(error);
        });
      });
    });
  }

  search(query: string): Observable<City[]> {
    const url = `${environment.apiUrl}/api/climate-api/api/city/?search=${query}`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json().features || [];
      return vals;
    });
  }
}
