import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { Risk } from '../../shared/models/risk.model';
import { PlanItApiHttp } from './api-http.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class RiskService {

  constructor(private apiHttp: PlanItApiHttp) {}

  risks(): Observable<Risk[]> {
    const url = `${environment.apiUrl}/api/risks/`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(e => e.risk as Risk);
    });
  }

}
