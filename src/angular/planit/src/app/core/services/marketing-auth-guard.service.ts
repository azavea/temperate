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
    // allow authenticated user to view marketing page with referral
    if (!!loggedIn && !route.url[0] && route.queryParams.ref === 'dashboard') {
      return true;
    // otherwise user will be redirected to the dashboard
    } else if (!!loggedIn) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
