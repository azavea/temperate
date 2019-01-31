import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Rx';

import { PlanItApiHttp } from '../../core/services/api-http.service';

import { User } from '../../shared/';

import { environment } from '../../../environments/environment';

@Injectable()
export class RemoveUserService {

  constructor(protected apiHttp: PlanItApiHttp) {}

  remove(email: string): Observable<any> {
    const body = JSON.stringify({
      'email': email
    });
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    const url = `${environment.apiUrl}/accounts/remove_user/`;
    return this.apiHttp.post(url, body, options);
  }
}
