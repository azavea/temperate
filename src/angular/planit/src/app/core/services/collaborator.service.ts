import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { Collaborator } from '../../shared/models/collaborator.model';
import { PlanItApiHttp } from './api-http.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class CollaboratorService {

  constructor(private apiHttp: PlanItApiHttp) {}

  list(): Observable<Collaborator[]> {
    const url = `${environment.apiUrl}/api/collaborators/`;
    return this.apiHttp.get(url)
      .map(resp => resp.json() || [] as Collaborator[]);
  }

}
