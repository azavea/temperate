import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { PlanAuthGuard } from './plan-auth-guard.service';

/**
 * Stores the URL of the previous route
 *
 * Should only be used by routes which have this as a guard,
 * and should always be used in conjunction with another guard
 * as the last guard in the list if the page should not always be accessible.
 *
 * e.g.
 *
 * { path: 'hello', component: HelloComponent, canActivate: [AuthGuard, PreviousRouteGuard] }
 *
 **/
@Injectable()
export class PreviousRouteGuard implements CanActivate {

  private url = '';
  private params = {};

  constructor(private planAuthGuard: PlanAuthGuard,
              private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Angular doesn't want to let you route to a URL with embedded query
    // parameters, so we need to get and store the path separately from the
    // query params
    const urlTree = this.router.parseUrl(this.router.url);
    this.url = this.urlTreePath(urlTree);
    this.params = urlTree.queryParams;
    return true;
  }

  get previousUrl() {
    return this.url;
  }

  get previousQueryParams() {
    return this.params;
  }

  get previousPage() {
    if (!this.url) {
      return null;
    }

    const labels = [
      ['/actions/action/new', 'Add Adaptation Action'],
      ['/actions/action/', 'Edit Adaptation Action'],
      ['/actions', 'Adaptation Actions'],
      ['/assessment/risk/new', 'Add Risk'],
      ['/assessment/risk/', 'Edit Risk'],
      ['/assessment', 'Vulnerability Assessment'],
      ['/dashboard', 'Dashboard'],
      ['/city-profile', 'City Profile'],
      ['/indicators', 'Indicators'],
      ['/settings', 'Settings'],
      ['/', 'Home']
    ];

    for (const [path, label] of labels) {
      if (this.url.startsWith(path)) {
        return label;
      }
    }
  }

  private urlTreePath(urlTree: UrlTree): string {
    if (urlTree.root.children.primary) {
      return '/' + urlTree.root.children.primary.segments.map(s => s.path).join('/');
    }
    return '/';
  }
}
