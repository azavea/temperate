import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Organization } from '../../shared/models/organization.model';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable()
export class PlanAuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private userService: UserService,
              private router: Router) {}

  // When applied, an app route is only available to authenticated users whose org has a plan,
  // with exception of the create org and create plan wizards
  // If logged in, but user's primary organization has no plan set up yet, show plan wizard.
  // Otherwise, the user is redirected to the public marketing page.
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const loggedIn = this.authService.isAuthenticated();
    if (loggedIn) {
      return this.userService.current().pipe(map(user => {
        if (user.primary_organization) {
          const org = new Organization(user.primary_organization);
          if (org.hasPlan()) {
            if (route.url[0].path === 'create-organization' || route.url[0].path === 'plan') {
              this.router.navigate(['/dashboard']);
              return false;
            }
            return true;
          } else if (route.url[0].path !== 'plan' && route.url[0].path !== 'settings' &&
                     route.url[0].path !== 'subscription') {
            if (org.isExpired()) {
              // direct user with expired subscription and no plan set up to subscription page
              this.router.navigate(['/subscription']);
            } else {
              // direct user to create organization plan, if one not set up yet
              this.router.navigate(['/plan']);
            }
            return false;
          } else {
            return true;
          }
        } else if (route.url[0].path !== 'create-organization') {
          this.router.navigate(['/create-organization']);
          return false;
        } else {
          return true;
        }
      })).first();
    } else {
      this.router.navigate(['/']);
      return Observable.from([false]);
    }
  }
}
