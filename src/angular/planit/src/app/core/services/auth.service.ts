import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';

@Injectable()
export class AuthService {

    private LOCALSTORAGE_TOKEN_KEY = 'auth.token';

    // TODO: Inject a window or localStorage service here to abstract implicit
    //       dependency on window
    constructor(protected http: Http, protected router: Router) {}

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
        });
    }

    logout(redirectTo: string = '/') {
        this.setToken(null);
        if (redirectTo) {
            this.router.navigate([redirectTo]);
        }
    }

    private setToken(token: string | null) {
        if (token) {
            window.localStorage.setItem(this.LOCALSTORAGE_TOKEN_KEY, token);
        } else {
            window.localStorage.removeItem(this.LOCALSTORAGE_TOKEN_KEY);
        }
    }
}
