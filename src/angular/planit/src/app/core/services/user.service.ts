import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { User } from '../../shared';
import { PlanItApiHttp } from './api-http.service';
import { CacheService } from './cache.service';

@Injectable()
export class UserService {

  constructor(private apiHttp: PlanItApiHttp, private cache: CacheService) {}

  private formatUser(user: User): any {
    // Delete the attached organization to ensure we don't accidentally alter
    // or create any organizations
    // Since we update with PATCH the user will still keep their primary_organization
    const formattedUser = cloneDeep(user);
    delete formattedUser.primary_organization;
    return Object.assign(formattedUser, {});
  }

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

  update(user: User): Observable<User> {
    const url = `${environment.apiUrl}/api/users/${user.id}/`;
    return this.apiHttp.patch(url, this.formatUser(user)).map(resp => {
      user = new User(resp.json());
      this.cache.delete(CacheService.CORE_USERSERVICE_CURRENT);
      return user;
    });
  }
}
