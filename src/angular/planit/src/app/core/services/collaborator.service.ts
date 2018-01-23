import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { Collaborator } from '../../shared/models/collaborator.model';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class CollaboratorService {

  private values: Collaborator[];

  constructor(private apiHttp: PlanItApiHttp) {}

  list(): Observable<Collaborator[]> {
    if (this.values !== undefined) {
      return Observable.of(this.values);
    }
    const url = `${environment.apiUrl}/api/collaborators/`;
    return this.apiHttp.get(url)
      .map(resp => {
        this.values = resp.json() || [] as Collaborator[];
        return this.values;
      });
  }

}
