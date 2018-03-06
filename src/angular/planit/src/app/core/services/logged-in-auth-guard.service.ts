import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot,
         CanActivate,
         Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable()
export class LoggedInAuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {}

  /* We want authenticated users to be redirected to the dashboard from '/', `/register`,
   * or `/login` but unauthenticated users to go to the marketing page.
   * To let authenticated users still access the marketing page when they explicitly
   * click a link to go there we need to add a ref to the link and check for it here.
   * Behavior designed after printful.com
   */
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const loggedIn = this.authService.isAuthenticated();
    if (loggedIn && !route.url[0] && route.queryParams.ref === 'footer') {
      return true;
    } else if (loggedIn) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
