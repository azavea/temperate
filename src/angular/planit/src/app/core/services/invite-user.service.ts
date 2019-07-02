import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable()
export class InviteUserService {

  constructor(protected http: HttpClient) {}

  invite(email: string): Observable<any> {
    const body = JSON.stringify({
      'email': email
    });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${environment.apiUrl}/accounts/invite_user/`;
    return this.http.post(url, body, {headers: headers});
  }
}
