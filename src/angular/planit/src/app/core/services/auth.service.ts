import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

import { Observable, Subject } from 'rxjs';

import { APICacheService } from 'climate-change-components';
import { environment } from '../../../environments/environment';
import { CORE_USERSERVICE_CURRENT } from '../constants/cache';

import { User } from '../../shared/';

@Injectable()
export class AuthService {

  private LOCALSTORAGE_TOKEN_KEY = 'auth.token';

  private _loggedIn = new Subject<void>();
  private _loggedOut = new Subject<void>();

  public loggedIn = this._loggedIn.asObservable();
  public loggedOut = this._loggedOut.asObservable();

  // TODO: Inject a window or localStorage service here to abstract implicit
  //       dependency on window
  constructor(protected http: HttpClient,
              protected router: Router,
              private cache: APICacheService) {}

  getToken(): string {
    return window.localStorage.getItem(this.LOCALSTORAGE_TOKEN_KEY) || null;
  }

  getUserFromUidToken(uid, token): Observable<User | null> {
    const url = `${environment.apiUrl}/api/user/${uid}/${token}`;
    return this.http.get(url).map(response => {
      const user = response.json();
      if (user) {
        return new User(user);
      }
      return null;
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(email: string, password: string): Observable<any> {
    const body = JSON.stringify({
      'email': email,
      'password': password
    });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${environment.apiUrl}/api-token-auth/`;
    return this.http.post(url, body, {headers: headers}).map(response => {
      const token = response.json().token;
      this.setToken(token);
      this._loggedIn.next();
    });
  }

  logout(redirectTo: string = '/', redirectOptions: NavigationExtras = {}) {
    this.setToken(null);
    this.cache.clear(CORE_USERSERVICE_CURRENT);
    this._loggedOut.next();
    if (redirectTo) {
      this.router.navigate([redirectTo], redirectOptions );
    }
  }

  resetPasswordSendEmail(email: string): Observable<any> {
    const body = JSON.stringify({
      email
    });
    const url = `${environment.apiUrl}/accounts/password_reset/send_email/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, body, {headers: headers});
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
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, body, {headers: headers});
  }

  private setToken(token: string | null) {
    if (token) {
      window.localStorage.setItem(this.LOCALSTORAGE_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(this.LOCALSTORAGE_TOKEN_KEY);
    }
  }
}
