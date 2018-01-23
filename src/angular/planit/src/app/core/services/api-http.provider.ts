import { Http, RequestOptions, XHRBackend } from '@angular/http';

import { PlanItApiHttp } from './api-http.service';
import { AuthService } from './auth.service';

export function apiHttpLoader(xhrBackend: XHRBackend,
                              requestOptions: RequestOptions,
                              authService: AuthService) {
                                return new PlanItApiHttp(xhrBackend, requestOptions, authService);
                              }

export let apiHttpProvider = {
  provide: PlanItApiHttp,
  useFactory: apiHttpLoader,
  deps: [XHRBackend, RequestOptions, AuthService]
};
