import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { CityProfileSummary } from '../../shared/models/city-profile-summary.model';


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

  constructor() {}

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
