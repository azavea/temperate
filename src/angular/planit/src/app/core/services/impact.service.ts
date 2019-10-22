import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Impact } from '../../shared/models/impact.model';

@Injectable()
export class ImpactService {

  constructor(private http: HttpClient) {}

  list(): Observable<Impact[]> {
    const url = `${environment.apiUrl}/api/impacts/`;
    return this.http.get<Impact[]>(url);
  }
}
