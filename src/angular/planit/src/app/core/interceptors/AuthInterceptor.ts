import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isInternalUrl = req.url.startsWith('/') || req.url.startsWith(environment.apiUrl);
    if (!this.authService.isAuthenticated() || !isInternalUrl) {
      return next.handle(req);
    }

    const authToken = this.authService.getToken();
    const authRequest = req.clone({ setHeaders: {
      Authorization: `Token ${authToken}`
    }});
    return next.handle(authRequest);
  }
}
