import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { PlanItApiHttp } from './api-http.service';
import { ActionType } from '../../shared/';
import { environment } from '../../../environments/environment';

@Injectable()
export class ActionTypeService {

  constructor(private apiHttp: PlanItApiHttp) { }

  list(): Observable<ActionType[]> {
    const url = `${environment.apiUrl}/api/action-types/`;
    return this.apiHttp.get(url).map(data => data.json() as ActionType[]);
  }

  nameList() {
    return this.list().map(actionTypes => actionTypes.map(at => at.name));
  }
}
