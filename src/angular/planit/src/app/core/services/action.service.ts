import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Action } from '../../shared/models/action.model';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class ActionService {

  constructor(private apiHttp: PlanItApiHttp) {}

  private formatAction(action: Action) {
    // Django expects pk's for related objects whereas the front end wants the full objs
    const formattedAction = cloneDeep(action);

    // Categories are optional, so default to an empty array if not set
    formattedAction.categories = formattedAction.categories || [];

    return Object.assign(formattedAction, { categories: formattedAction.categories.map(c => c.id)});
  }

  list(): Observable<Action[]> {
    const url = `${environment.apiUrl}/api/actions/`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(a => new Action(a));
    });
  }

  get(id: string): Observable<Action> {
   const url = `${environment.apiUrl}/api/actions/${id}/`;
   return this.apiHttp.get(url).map(resp => {
     return new Action(resp.json());
   });
  }

  create(action: Action): Observable<Action> {
    const url = `${environment.apiUrl}/api/actions/`;
    return this.apiHttp.post(url, this.formatAction(action)).map(resp => {
      return new Action(resp.json());
    });
  }

  update(action: Action): Observable<Action> {
    const url = `${environment.apiUrl}/api/actions/${action.id}/`;
    return this.apiHttp.put(url, this.formatAction(action)).map(resp => {
      return new Action(resp.json());
    });
  }

  delete(action: Action) {
    const url = `${environment.apiUrl}/api/actions/${action.id}/`;
    return this.apiHttp.delete(url);
  }
}
