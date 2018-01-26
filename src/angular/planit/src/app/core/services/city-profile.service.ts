import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { CityProfileSummary } from '../../shared/models/city-profile-summary.model';

// Remove once comSummary() and overallSummary() stubs are implemented
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

@Injectable()
export class CityProfileService {

  constructor() { }

  comSummary(): Observable<CityProfileSummary> {
    const total = 6;
    const complete = getRandomInt(total + 1);
    return Observable.of({complete: complete, total: total});
  }

  overallSummary(): Observable<CityProfileSummary> {
    const total = 14;
    const complete = getRandomInt(total + 1);
    return Observable.of({complete: complete, total: total});
  }
}
