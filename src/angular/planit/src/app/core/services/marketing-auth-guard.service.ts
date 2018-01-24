import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class MarketingAuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {}

  // Selective routing to marketing page, designed after printful.com
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const loggedIn = this.authService.isAuthenticated();
    if (!loggedIn ||
        !!loggedIn && route.queryParams.ref && route.queryParams.ref === 'dashboard') {
      return true;
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
}
