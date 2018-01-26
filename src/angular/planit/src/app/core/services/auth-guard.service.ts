import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {}

  // When applied, an app route is only available to authenticated users.
  // Otherwise the user is redirected to the public marketing page.
  canActivate(): boolean {
    const loggedIn = this.authService.isAuthenticated();
    if (loggedIn) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
