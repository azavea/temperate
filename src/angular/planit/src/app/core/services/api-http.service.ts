import { HttpBackend, HttpClient, HttpHeaders, HttpParams,
         HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError as observableThrowError } from 'rxjs';

import { AuthService } from './auth.service';


/**
 * Wrapper for Http that appends authorization headers for requests to the Temperate backend,
 * and redirects unauthorized responses to the homepage.
 */
@Injectable()
export class PlanItApiHttp extends HttpClient {

  constructor(protected _backend: HttpBackend,
              protected _defaultHeaders: HttpHeaders,
              protected authService: AuthService) {
    super(_backend, _defaultHeaders);
  }

  request(first: string | HttpRequest<any>, url?: string, options?: any): Observable<any> {
    return super.request(url, this.appendAPIHeaders(options)).catch((error: HttpResponse) => {
      if (error.status === 401) {
        this.authService.logout();
      }
      return observableThrowError(error);
    });
  }

  get(url: string, options?: any): Observable<any> {
    return super.get(url, this.appendAPIHeaders(options));
  }

  patch(url: string, body: any, options?: any): Observable<any> {
    return super.patch(url, body, this.appendAPIHeaders(options));
  }

  post(url: string, body: any, options?: any): Observable<any> {
    return super.post(url, body, this.appendAPIHeaders(options));
  }

  put(url: string, body: any, options?: any): Observable<any> {
    return super.put(url, body, this.appendAPIHeaders(options));
  }

  delete(url: string, options?: any): Observable<any> {
    return super.delete(url, this.appendAPIHeaders(options));
  }

  private appendAPIHeaders(options?: any): any {
    const token = this.authService.getToken();
    if (!token) {
      this.authService.logout();
      return;
    }
    if (!options) {
      options = {
        headers: new HttpHeaders(),
        params: new HttpParams()
      };
    }
    if (!options.headers) {
      options.headers = new HttpHeaders();
    }
    options.headers.set('Authorization', 'Token ' + token);
    options.headers.set('Accept', 'application/json');

    if (!options.params) {
      options.params = new HttpParams();
    }
    // Switch params to instance of HttpParams if options.params is string
    //  so that we can always safely use the HttpParams.append() method to add 'format'
    if (typeof options.params === 'string') {
      options.params = new HttpParams(options.params);
    }

    return options;
  }
}
