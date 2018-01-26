import { Component, OnInit } from '@angular/core';

import { CityProfileService } from '../../core/services/city-profile.service';
import { CityProfileSummary } from '../../shared/';

@Component({
  selector: 'app-city-profile-summary',
  templateUrl: 'city-profile-summary.component.html'
})

export class CityProfileSummaryComponent implements OnInit {

  public com: CityProfileSummary;
  public overall: CityProfileSummary;

  constructor(private cityProfileService: CityProfileService) { }

  ngOnInit() {
    this.updateSummaries();
  }

  updateSummaries() {
    this.cityProfileService.comSummary().subscribe(s => this.com = s);
    this.cityProfileService.overallSummary().subscribe(s => this.overall = s);
  }

  get comPercentage() {
    return this.com ? Math.floor(this.com.complete / this.com.total * 100) : 0;
  }

  get overallPercentage() {
    return this.overall ?
      Math.floor(this.overall.complete / this.overall.total * 100) : 0;
  }
}
