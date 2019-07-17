import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Action } from '../../shared/models/action.model';

@Injectable()
export class ActionService {

  constructor(private http: HttpClient) {}

  private formatAction(action: Action) {
    // Django expects pk's for related objects whereas the front end wants the full objs
    const formattedAction = cloneDeep(action);

    // Categories are optional, so default to an empty array if not set
    formattedAction.categories = formattedAction.categories || [];

    return Object.assign(formattedAction, { categories: formattedAction.categories.map(c => c.id)});
  }

  list(): Observable<Action[]> {
    const url = `${environment.apiUrl}/api/actions/`;
    return this.http.get<any[]>(url).pipe(map(resp => {
      const vals = resp || [];
      return vals.map(a => new Action(a));
    }));
  }

  get(id: string): Observable<Action> {
   const url = `${environment.apiUrl}/api/actions/${id}/`;
   return this.http.get(url).pipe(map(resp => {
     return new Action(resp);
   }));
  }

  create(action: Action): Observable<Action> {
    const url = `${environment.apiUrl}/api/actions/`;
    return this.http.post(url, this.formatAction(action)).pipe(map(resp => {
      return new Action(resp);
    }));
  }

  update(action: Action): Observable<Action> {
    const url = `${environment.apiUrl}/api/actions/${action.id}/`;
    return this.http.put(url, this.formatAction(action)).pipe(map(resp => {
      return new Action(resp);
    }));
  }

  delete(action: Action) {
    const url = `${environment.apiUrl}/api/actions/${action.id}/`;
    return this.http.delete(url);
  }
}
