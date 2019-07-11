import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ActionCategory } from '../../shared/models/action-category.model';

@Injectable()
export class ActionCategoryService {

  constructor(private http: HttpClient) {}

  list(): Observable<ActionCategory[]> {
    const url = `${environment.apiUrl}/api/action-categories/`;
    return this.http.get<ActionCategory[]>(url);
  }
}
