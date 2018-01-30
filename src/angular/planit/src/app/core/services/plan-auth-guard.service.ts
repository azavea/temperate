import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { Organization } from '../../shared/models/organization.model';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable()
export class PlanAuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private userService: UserService,
              private router: Router) {}

  // When applied, an app route is only available to authenticated users whose org has a plan.
  // If logged in, but user's primary organization has no plan set up yet, show plan wizard.
  // Otherwise, the user is redirected to the public marketing page.
  canActivate(): Observable<boolean> {
    const loggedIn = this.authService.isAuthenticated();
    if (loggedIn) {
      return this.userService.current().map(user => {
        const org = new Organization(user.primary_organization);
        if (org.hasPlan()) {
          return true;
        } else {
          // direct user to create organization plan, if one not set up yet
          this.router.navigate(['/plan']);
          return false;
        }
      }).first();
    } else {
      this.router.navigate(['/']);
      return Observable.from([false]);
    }
  }
}
