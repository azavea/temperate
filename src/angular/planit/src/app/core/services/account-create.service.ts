
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError as observableThrowError } from 'rxjs';

import * as cloneDeep from 'lodash.clonedeep';

import { User } from '../../shared';

import { environment } from '../../../environments/environment';

/*
 * Account Creation Service
 * For signing up for a new account.
 */
@Injectable()
export class AccountCreateService {

  constructor(private http: HttpClient) {}

  private formatUser(user: User, key?: string): any {
    if (key) {
      const formattedUser = cloneDeep(user);
      formattedUser.activation_key = key;
      return formattedUser;
    }
    return user;
  }

  public create(user: User, key?: string): Observable<User> {

    const url = `${environment.apiUrl}/api/users/`;
    return this.http.post(url, this.formatUser(user, key))
      .map(resp => resp.json() || {} as User)
      .catch((error: Response) => {
        return observableThrowError(error);
      });
  }
}
