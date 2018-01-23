import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { RelatedAdaptiveValue } from '../../shared/models/related-adaptive-value.model';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class RelatedAdaptiveValueService {

  private values: RelatedAdaptiveValue[] = null;

  constructor(private apiHttp: PlanItApiHttp) {}

  list(): Observable<RelatedAdaptiveValue[]> {
    if (this.values !== null) {
      return Observable.of(this.values);
    }
    const url = `${environment.apiUrl}/api/related-adaptive-values/`;
    return this.apiHttp.get(url)
      .map(resp => {
        this.values = resp.json() || [] as RelatedAdaptiveValue[];
        return this.values;
      });
  }

}
