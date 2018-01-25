import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';

import { City } from 'climate-change-components';

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

    const url = `${environment.apiUrl}/api/climate-api/api/city/`;

    return Observable.create((observer) => {
      this.userService.current().subscribe(user => {
        console.log('user', user);
          this.apiHttp.get(`${url}${user.primary_organization.location.properties.api_city_id}`)
            .subscribe(resp => {
          const json = resp.json();
          if (json) {
            city = json;
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
}
