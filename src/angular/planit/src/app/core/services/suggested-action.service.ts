import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Risk } from '../../shared/models/risk.model';
import { SuggestedAction } from '../../shared/models/suggested-action.model';

@Injectable()
export class SuggestedActionService {
  constructor(private http: HttpClient) {}

  list(risk: Risk): Observable<SuggestedAction[]> {
    const url = `${environment.apiUrl}/api/suggestions/?risk=${risk.id}`;
    return this.http.get<any[]>(url).pipe(map(resp => {
      const vals = resp || [];
      return vals.map(a => new SuggestedAction(a));
    }));
  }

  get(id: string): Observable<SuggestedAction> {
   const url = `${environment.apiUrl}/api/suggestions/${id}/`;
   return this.http.get(url).pipe(map(resp => {
     return new SuggestedAction(resp);
   }));
  }
}
