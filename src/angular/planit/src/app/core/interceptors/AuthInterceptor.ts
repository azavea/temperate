import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.authService.isAuthenticated() || !req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    const authToken = this.authService.getToken();
    const authRequest = req.clone({ setHeaders: {
      Authorization: `Token ${authToken}`
    }});
    return next.handle(authRequest);
  }
}
