import { Component, OnInit } from '@angular/core';

import { PreviousRouteGuard } from '../../core/services/previous-route-guard.service';

@Component({
  selector: 'app-back-button',
  templateUrl: 'back-button.component.html'
})

export class BackButtonComponent implements OnInit {

  public previousPage = 'Home';
  public previousUrl = '/';
  public previousParams = {};

  constructor(protected previousRouteGuard: PreviousRouteGuard) { }

  ngOnInit() {
    this.previousUrl = this.previousRouteGuard.previousUrl;
    this.previousPage = this.previousRouteGuard.previousPage;
    this.previousParams = this.previousRouteGuard.previousQueryParams;
  }
}
