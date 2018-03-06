import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable, Subject } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { User } from '../../shared';
import { PlanItApiHttp } from './api-http.service';
import { CacheService } from './cache.service';

@Injectable()
export class UserService {

  private _currentUser = new Subject<User>();

  public currentUser = this._currentUser.asObservable();

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
        this._currentUser.next(user);
        return user;
      }
      return null;
    });
  }

  invalidate() {
    this.cache.delete(CacheService.CORE_USERSERVICE_CURRENT);
    // Trigger requery and internal push to currentUser in current() call
    this.current().subscribe(() => undefined);
  }

  update(user: User): Observable<User> {
    const url = `${environment.apiUrl}/api/users/${user.id}/`;
    return this.apiHttp.patch(url, this.formatUser(user)).switchMap(resp => {
      this.cache.delete(CacheService.CORE_USERSERVICE_CURRENT);
      return this.current();
    });
  }
}
