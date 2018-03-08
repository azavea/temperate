import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';

@Injectable()
export class PasswordResetGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot) {
    const token = route.params['token'];
    if (!token) {
      this.router.navigate(['/']);
      return false;
    }
    // Check for token validity by attempting to reset the password with
    // invalid passwords.
    return this.authService.resetPassword(token, '', '')
      .map(data => {
        return true;
      })
      .catch(error => {
        const errors = error.json().errors;
        const tokenValid = errors.non_field_errors === undefined;
        if (!tokenValid) {
          this.router.navigate(['/login'], {queryParams: {resetExpired: true}});
        }
        return Observable.of(tokenValid);
      }).first();
  }
}
