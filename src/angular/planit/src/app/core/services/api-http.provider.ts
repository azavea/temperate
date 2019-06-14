import { HttpClient, HttpHeaders, HttpXhrBackend } from '@angular/common/http';

import { PlanItApiHttp } from './api-http.service';
import { AuthService } from './auth.service';

export function apiHttpLoader(xhrBackend: HttpXhrBackend,
                              headers: HttpHeaders,
                              authService: AuthService) {
                                return new PlanItApiHttp(xhrBackend, headers, authService);
                              }

export let apiHttpProvider = {
  provide: PlanItApiHttp,
  useFactory: apiHttpLoader,
  deps: [HttpXhrBackend, HttpHeaders, AuthService]
};
