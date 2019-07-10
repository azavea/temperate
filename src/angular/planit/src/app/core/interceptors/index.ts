import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './AuthInterceptor';
import { AuthErrorInterceptor } from './AuthErrorInterceptor';

export const httpInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: AuthErrorInterceptor, multi: true}
];
