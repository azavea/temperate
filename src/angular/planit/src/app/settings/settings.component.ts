import { Component, OnInit } from '@angular/core';

import { PreviousRouteGuard } from './../core/services/previous-route-guard.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public previousPage = 'Home';
  public previousUrl = '/';
  public previousParams = {};

  constructor(private previousRouteGuard: PreviousRouteGuard) { }

  ngOnInit() {
    this.previousUrl = this.previousRouteGuard.previousUrl;
    this.previousPage = this.previousRouteGuard.previousPage;
    this.previousParams = this.previousRouteGuard.previousQueryParams;
  }

}
