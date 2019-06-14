import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { APICacheService } from 'climate-change-components';
import { environment } from '../../../environments/environment';
import { ActionType,  } from '../../shared/';
import { CORE_ACTIONTYPESERVICE_LIST } from '../constants/cache';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class ActionTypeService {

  constructor(private apiHttp: PlanItApiHttp,
              private cache: APICacheService) { }

  list(): Observable<ActionType[]> {
    const url = `${environment.apiUrl}/api/action-types/`;
    const request = this.apiHttp.get(url);
    const response = this.cache.get(CORE_ACTIONTYPESERVICE_LIST, request);

    return response.pipe(map((resp) => {
      const data = resp.json() as ActionType[];
      return data;
    }));
  }

  nameList() {
    return this.list().pipe(map(actionTypes => actionTypes.map(at => at.name)));
  }
}
