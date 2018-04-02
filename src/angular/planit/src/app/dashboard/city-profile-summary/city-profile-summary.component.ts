import { Component, Input, OnChanges } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { CityProfileService } from '../../core/services/city-profile.service';
import { CityProfileSummary, Organization } from '../../shared/';

@Component({
  selector: 'app-city-profile-summary',
  templateUrl: 'city-profile-summary.component.html'
})

export class CityProfileSummaryComponent implements OnChanges {

  @Input() organization: Organization;

  public required: CityProfileSummary;
  public overall: CityProfileSummary;

  constructor(private cityProfileService: CityProfileService) { }

  ngOnChanges() {
    this.updateSummaries();
  }

  isDone(summary: CityProfileSummary) {
    return summary && summary.complete === summary.total;
  }

  percentage(summary: CityProfileSummary) {
    return summary ? Math.floor(summary.complete / summary.total * 100) : 0;
  }

  updateSummaries() {
    if (!this.organization) {
      return;
    }

    this.cityProfileService.get(this.organization).subscribe(profile => {
      this.required = {
        complete: profile.getCompletedPropCount(true),
        total: profile.getTotalPropCount(true)
      };
      this.overall = {
        complete: profile.getCompletedPropCount(),
        total: profile.getTotalPropCount()
      };
    });
  }
}
