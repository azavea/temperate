import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { Risk } from '../../shared/models/risk.model';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class RiskService {

  constructor(private apiHttp: PlanItApiHttp) {}

  private formatRisk(risk: Risk) {
    // Django expects pk's for related objects whereas the front end wants the full objs
    const formattedRisk = cloneDeep(risk);
    return Object.assign(formattedRisk, { weather_event: formattedRisk.weather_event.id,
                         community_system: formattedRisk.community_system.id });
  }

  list(): Observable<Risk[]> {
    const url = `${environment.apiUrl}/api/risks/`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(r => new Risk(r));
    });
  }

  get(id: string): Observable<Risk> {
   const url = `${environment.apiUrl}/api/risks/${id}/`;
   return this.apiHttp.get(url).map(resp => {
     return new Risk(resp.json());
   });
  }

  create(risk: Risk): Observable<Risk> {
    const url = `${environment.apiUrl}/api/risks/`;
    return this.apiHttp.post(url, this.formatRisk(risk)).map(resp => {
      return new Risk(resp.json());
    });
  }

  update(risk: Risk): Observable<Risk> {
    const url = `${environment.apiUrl}/api/risks/${risk.id}/`;
    return this.apiHttp.put(url, this.formatRisk(risk)).map(resp => {
      return new Risk(resp.json());
    });
  }

  delete(risk: Risk) {
    const url = `${environment.apiUrl}/api/risks/${risk.id}/`;
    return this.apiHttp.delete(url);
  }
}
