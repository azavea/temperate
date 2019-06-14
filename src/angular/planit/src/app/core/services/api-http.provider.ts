import { HttpClient, HttpXhrBackend } from '@angular/common/http';

import { PlanItApiHttp } from './api-http.service';
import { AuthService } from './auth.service';

export function apiHttpLoader(xhrBackend: HttpXhrBackend,
                              authService: AuthService) {
                                return new PlanItApiHttp(xhrBackend, authService);
                              }

export let apiHttpProvider = {
  provide: PlanItApiHttp,
  useFactory: apiHttpLoader,
  deps: [HttpXhrBackend, AuthService]
};
