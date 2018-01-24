import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {}

  // Privatize view for logged in users
  canActivate(): boolean {
    const loggedIn = this.authService.isAuthenticated();
    // allow authenticated app views
    if (!!loggedIn) {
      return true;
    // all else reroute to the marketing page
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
