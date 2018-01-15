import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { User } from '../../shared';
import { CacheService } from './cache.service';
import { PlanItApiHttp } from './api-http.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class UserService {

  constructor(private apiHttp: PlanItApiHttp, private cache: CacheService) {}

  current(): Observable<User | null> {
    let user = this.cache.get(CacheService.CORE_USERSERVICE_CURRENT);
    if (user) {
      return Observable.of(user);
    }

    const url = `${environment.apiUrl}/api/user/`;
    return this.apiHttp.get(url).map(resp => {
      const json = resp.json();
      if (json) {
        user = new User(json);
        this.cache.set(CacheService.CORE_USERSERVICE_CURRENT, user);
        return user;
      }
      return null;
    });
  }
}
