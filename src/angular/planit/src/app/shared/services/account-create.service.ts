import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { User } from '../models/user.model';

// TODO: add
//import { apiHost } from '../constants';

/*
 * Account Creation Service
 * For signing up for a new account.
 */
@Injectable()
export class AccountCreateService {

    constructor(private http: Http) {}

    public create(user: User): Observable<User> {
      // TODO: import
      const apiHost = 'http://localhost:8100';

      const url = `${apiHost}/api/users/`;
      return this.http.post(url, user).map(resp => resp.json() || {} as User);
    }
}
