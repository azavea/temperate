import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';

import { Observable, Subject } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { CacheService } from './cache.service';

@Injectable()
export class AuthService {

  private LOCALSTORAGE_TOKEN_KEY = 'auth.token';

  private _loggedIn = new Subject<void>();
  private _loggedOut = new Subject<void>();

  public loggedIn = this._loggedIn.asObservable();
  public loggedOut = this._loggedOut.asObservable();

  // TODO: Inject a window or localStorage service here to abstract implicit
  //       dependency on window
  constructor(protected http: Http,
              protected router: Router,
              private cache: CacheService) {}

  getToken(): string {
    return window.localStorage.getItem(this.LOCALSTORAGE_TOKEN_KEY) || null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(email: string, password: string): Observable<any> {
    const body = JSON.stringify({
      'email': email,
      'password': password
    });
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    const url = `${environment.apiUrl}/api-token-auth/`;
    return this.http.post(url, body, options).map(response => {
      const token = response.json().token;
      this.setToken(token);
      this._loggedIn.next();
    });
  }

  logout(redirectTo: string = '/') {
    this.setToken(null);
    this.cache.delete(CacheService.CORE_USERSERVICE_CURRENT);
    this.cache.delete(CacheService.CORE_CITYSERVICE_CURRENT);
    this._loggedOut.next();
    if (redirectTo) {
      this.router.navigate([redirectTo]);
    }
  }

  resetPasswordSendEmail(email: string): Observable<any> {
    const body = JSON.stringify({
      email
    });
    const url = `${environment.apiUrl}/accounts/password_reset/send_email/`;
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    return this.http.post(url, body, options);
  }

  resetPassword(uid: string, token: string, new_password1: string,
                new_password2: string): Observable<any> {
    const body = JSON.stringify({
      uid,
      token,
      new_password1,
      new_password2
    });
    const url = `${environment.apiUrl}/accounts/password_reset/`;
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    return this.http.post(url, body, options);
  }

  private setToken(token: string | null) {
    if (token) {
      window.localStorage.setItem(this.LOCALSTORAGE_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(this.LOCALSTORAGE_TOKEN_KEY);
    }
  }
}
