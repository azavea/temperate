import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { ActionType } from '../../shared/';
import { PlanItApiHttp } from './api-http.service';
import { CacheService } from './cache.service';

@Injectable()
export class ActionTypeService {

  constructor(private apiHttp: PlanItApiHttp,
              private cache: CacheService) { }

  list(): Observable<ActionType[]> {
    const list = this.cache.get(CacheService.CORE_ACTIONTYPESERVICE_LIST);
    if (list) {
      return Observable.of(list);
    }
    const url = `${environment.apiUrl}/api/action-types/`;
    return this.apiHttp.get(url).map(response => {
      const data = response.json() as ActionType[];
      if (data) {
        this.cache.set(CacheService.CORE_ACTIONTYPESERVICE_LIST, data);
      }
      return data;
    });
  }

  nameList() {
    return this.list().map(actionTypes => actionTypes.map(at => at.name));
  }
}
