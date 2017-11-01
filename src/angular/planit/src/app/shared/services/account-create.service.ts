import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { User } from '../models/user.model';

// TODO: add when #159 done
//import { environment } from '../../../environments/environment';

/*
 * Account Creation Service
 * For signing up for a new account.
 */
@Injectable()
export class AccountCreateService {

    constructor(private http: Http) {}

    public create(user: User): Observable<User> {

      // TODO: import when #159 done
      const environment = {apiUrl: 'http://localhost:8100'};

      const url = `${environment.apiUrl}/api/users/`;
      return this.http.post(url, user)
        .map(resp => resp.json() || {} as User)
        .catch((error: Response) => {
            return Observable.throw(error);
        });;
    }
}
