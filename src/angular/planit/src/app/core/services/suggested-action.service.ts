import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { Risk } from '../../shared/models/risk.model';
import { SuggestedAction } from '../../shared/models/suggested-action.model';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class SuggestedActionService {

  constructor(private apiHttp: PlanItApiHttp) {}

  list(risk: Risk): Observable<SuggestedAction[]> {
    const url = `${environment.apiUrl}/api/suggestions/?risk=${risk.id}`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(a => new SuggestedAction(a));
    });
  }

  get(id: string): Observable<SuggestedAction> {
   const url = `${environment.apiUrl}/api/suggestions/${id}/`;
   return this.apiHttp.get(url).map(resp => {
     return new SuggestedAction(resp.json());
   });
  }
}
