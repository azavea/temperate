import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { CityProfileService } from '../../core/services/city-profile.service';
import { CityProfileSummary } from '../../shared/';

@Component({
  selector: 'app-city-profile-summary',
  templateUrl: 'city-profile-summary.component.html'
})

export class CityProfileSummaryComponent implements OnInit {

  public required: CityProfileSummary;
  public overall: CityProfileSummary;

  constructor(private cityProfileService: CityProfileService) { }

  ngOnInit() {
    this.updateSummaries();
  }

  isDone(summary: CityProfileSummary) {
    return summary && summary.complete === summary.total;
  }

  percentage(summary: CityProfileSummary) {
    return summary ? Math.floor(summary.complete / summary.total * 100) : 0;
  }

  updateSummaries() {
    this.cityProfileService.requiredSummary().subscribe(s => this.required = s);
    this.cityProfileService.overallSummary().subscribe(s => this.overall = s);
  }
}
