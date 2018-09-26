import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { Organization } from '../../shared/models/organization.model';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable()
export class ExpirationGuard implements CanActivate {

  constructor(private authService: AuthService,
              private userService: UserService,
              private router: Router) {}

  // When applied, an app route is only available to authenticated users whose org
  // subscription is active else they are sent to the expired page
  // Valid users hitting the expired page will reroute to the dashboard
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const loggedIn = this.authService.isAuthenticated();
    if (loggedIn) {
      return this.userService.current().map(user => {
        if (user.primary_organization) {
          const org = new Organization(user.primary_organization);
          if (org.isExpired() && org.hasPlan()) {
            if (route.url[0].path !== 'expired') {
              this.router.navigate(['/expired']);
              return false;
            } else {
              return true;
            }
          }
        }
        if (route.url[0].path === 'expired') {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      }).first();
    } else {
      return true;
    }
  }
}
