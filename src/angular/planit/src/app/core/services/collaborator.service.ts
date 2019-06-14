import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Collaborator } from '../../shared/models/collaborator.model';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class CollaboratorService {

  private values: Collaborator[];

  constructor(private apiHttp: PlanItApiHttp) {}

  list(): Observable<Collaborator[]> {
    if (this.values !== undefined) {
      return of(this.values);
    }
    const url = `${environment.apiUrl}/api/collaborators/`;
    return this.apiHttp.get(url)
      .pipe(map(resp => {
        this.values = resp.json() || [] as Collaborator[];
        return this.values;
      }));
  }

}
