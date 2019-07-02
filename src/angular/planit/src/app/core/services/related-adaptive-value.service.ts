import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { RelatedAdaptiveValue } from '../../shared/models/related-adaptive-value.model';

@Injectable()
export class RelatedAdaptiveValueService {

  private values: RelatedAdaptiveValue[] = null;

  constructor(private http: HttpClient) {}

  list(): Observable<RelatedAdaptiveValue[]> {
    if (this.values !== null) {
      return of(this.values);
    }
    const url = `${environment.apiUrl}/api/related-adaptive-values/`;
    return this.http.get<RelatedAdaptiveValue[]>(url)
      .pipe(map(resp => {
        this.values = resp || [];
        return this.values;
      }));
  }

}
