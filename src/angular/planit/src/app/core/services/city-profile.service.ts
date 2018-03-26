import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { CityProfile, CityProfileSummary, Organization } from '../../shared/';
import { PlanItApiHttp } from './api-http.service';

import { environment } from '../../../environments/environment';


@Injectable()
export class CityProfileService {

  // Remove fields once comSummary() and overallSummary() stubs are implemented
  private count = 0;
  private required = [{
    complete: 0,
    total: 3
  }, {
    complete: 2,
    total: 3
  }, {
    complete: 3,
    total: 3
  }, {
    complete: 3,
    total: 3
  }];
  private overall = [{
    complete: 0,
    total: 8
  }, {
    complete: 2,
    total: 8
  }, {
    complete: 5,
    total: 8
  }, {
    complete: 8,
    total: 8
  }];

  constructor(private apiHttp: PlanItApiHttp) {}

  get(organization: Organization): Observable<CityProfile> {
    const url = `${environment.apiUrl}/api/organizations/${organization.id}/city-profile/`;
    return this.apiHttp.get(url).map(response => {
      const data = response.json();
      return new CityProfile(data);
    });
  }

  update(cityProfile: CityProfile): Observable<CityProfile> {
    const url = `${environment.apiUrl}/api/organizations/${cityProfile.organization}/city-profile/`;
    return this.apiHttp.put(url, cityProfile).map(response => {
      const data = response.json();
      return new CityProfile(data);
    });
  }

  requiredSummary(): Observable<CityProfileSummary> {
    const index = this.count % this.required.length;
    return Observable.of(Object.assign({}, this.required[index]));
  }

  overallSummary(): Observable<CityProfileSummary> {
    const index = this.count % this.overall.length;
    this.count = this.count + 1;
    return Observable.of(Object.assign({}, this.overall[index]));
  }
}
