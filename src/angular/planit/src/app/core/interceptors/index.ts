import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthErrorInterceptor } from './AuthErrorInterceptor';
import { AuthInterceptor } from './AuthInterceptor';

export const httpInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: AuthErrorInterceptor, multi: true}
];
