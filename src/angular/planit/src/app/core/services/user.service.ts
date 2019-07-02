import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { APICacheService } from '../../climate-api';
import { CORE_USERSERVICE_CURRENT } from '../constants/cache';
import { User } from '../../shared';


@Injectable()
export class UserService {

  private _currentUser = new Subject<User>();

  public currentUser = this._currentUser.asObservable();

  constructor(private http: HttpClient, private cache: APICacheService) {}

  private formatUser(user: User): any {
    const formattedUser = cloneDeep(user);
    // Do not attempt to send organization model object in JSON, as endpoint expects a string.
    // Instead convert into PKs which the backend can handle
    if (formattedUser.primary_organization) {
      formattedUser.primary_organization = formattedUser.primary_organization.id;
    }
    formattedUser.organizations = formattedUser.organizationIds();
    formattedUser.removed_organizations = formattedUser.removedOrganizationIds();
    return Object.assign(formattedUser, {});
  }

  current(): Observable<User | null> {
    const url = `${environment.apiUrl}/api/user/`;
    const request = this.http.get(url);
    const response = this.cache.get(CORE_USERSERVICE_CURRENT, request);
    return response.pipe(map((resp) => {
      if (resp) {
        const user = new User(resp);
        this._currentUser.next(user);
        return user;
      }
      return null;
    }));
  }

  invalidate() {
    this.cache.clear(CORE_USERSERVICE_CURRENT);
    // Trigger requery and internal push to currentUser in current() call
    this.current().subscribe(() => undefined);
  }

  update(user: User): Observable<User> {
    const url = `${environment.apiUrl}/api/users/${user.id}/`;
    return this.http.patch(url, this.formatUser(user)).pipe(switchMap(resp => {
      this.cache.clear(CORE_USERSERVICE_CURRENT);
      return this.current();
    }));
  }
}
