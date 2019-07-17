import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable()
export class RemoveUserService {

  constructor(protected http: HttpClient) {}

  remove(email: string): Observable<any> {
    const body = JSON.stringify({
      'email': email
    });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${environment.apiUrl}/accounts/remove_user/`;
    return this.http.post(url, body, {headers: headers});
  }
}
