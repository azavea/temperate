import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

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
      .map(data => {
        return true;
      })
      .catch(error => {
        const errors = error.json();
        const tokenValid = errors.token === undefined && errors.uid === undefined;
        if (!tokenValid) {
          this.router.navigate(['/login'], {queryParams: {resetExpired: true}});
        }
        return Observable.of(tokenValid);
      }).first();
  }
}
