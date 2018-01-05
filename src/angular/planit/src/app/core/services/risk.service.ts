import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import * as cloneDeep from 'lodash.clonedeep';

import { Risk } from '../../shared/models/risk.model';
import { PlanItApiHttp } from './api-http.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class RiskService {

  constructor(private apiHttp: PlanItApiHttp) {}

  private formatRisk(risk: Risk) {
    // Django expects pk's for related objects whereas the front end wants the full objs
    const formattedRisk = cloneDeep(risk);
    return Object.assign(formattedRisk, { weatherEvent: formattedRisk.weatherEvent.id,
                         communitySystem: formattedRisk.communitySystem.id });
  }

  list(): Observable<Risk[]> {
    const url = `${environment.apiUrl}/api/risks/`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(r => r as Risk);
    });
  }

  get(id: string): Observable<Risk> {
   const url = `${environment.apiUrl}/api/risks/${id}/`;
   return this.apiHttp.get(url).map(resp => {
     return resp.json() as Risk;
   });
  }

  create(risk: Risk): Observable<Risk> {
    const url = `${environment.apiUrl}/api/risks/`;
    return this.apiHttp.post(url, this.formatRisk(risk)).map(resp => {
      return resp.json() as Risk;
    });
  }

  update(risk: Risk): Observable<Risk> {
    const url = `${environment.apiUrl}/api/risks/${risk.id}/`;
    return this.apiHttp.put(url, this.formatRisk(risk)).map(resp => {
      return resp.json() as Risk;
    });
  }
}
