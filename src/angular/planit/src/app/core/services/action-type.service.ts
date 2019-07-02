import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { APICacheService } from '../../climate-api';
import { ActionType,  } from '../../shared/';
import { CORE_ACTIONTYPESERVICE_LIST } from '../constants/cache';

@Injectable()
export class ActionTypeService {

  constructor(private http: HttpClient,
              private cache: APICacheService) { }

  list(): Observable<ActionType[]> {
    const url = `${environment.apiUrl}/api/action-types/`;
    const request = this.http.get<ActionType[]>(url);
    return this.cache.get(CORE_ACTIONTYPESERVICE_LIST, request);
  }

  nameList() {
    return this.list().pipe(map(actionTypes => actionTypes.map(at => at.name)));
  }
}
