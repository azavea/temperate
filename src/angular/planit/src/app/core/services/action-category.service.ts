import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { ActionCategory } from '../../shared/models/action-category.model';
import { PlanItApiHttp } from './api-http.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class ActionCategoryService {

  constructor(private apiHttp: PlanItApiHttp) {}

  list(): Observable<ActionCategory[]> {
    const url = `${environment.apiUrl}/api/action-categories/`;
    return this.apiHttp.get(url).map(resp => {
      const vals = resp.json() || [];
      return vals.map(r => r as ActionCategory);
    });
  }
}
