import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class PasswordResetGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot) {
    const uid = route.params['uid'];
    const token = route.params['token'];
    if (!uid || !token) {
      this.router.navigate(['/']);
      return false;
    }
    // Check for token validity by attempting to reset the password with
    // invalid passwords.
    return this.authService.resetPassword(uid, token, 'bad', 'password')
      .pipe(map(data => {
        return true;
      }))
      .pipe(catchError(error => {
        const errors = error.json();
        const tokenValid = errors.token === undefined && errors.uid === undefined;
        if (!tokenValid) {
          this.router.navigate(['/login'], {queryParams: {resetExpired: true}});
        }
        return of(tokenValid);
      }), first());
  }
}
