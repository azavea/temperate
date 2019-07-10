import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Collaborator } from '../../shared/models/collaborator.model';

@Injectable()
export class CollaboratorService {

  private values: Collaborator[];

  constructor(private http: HttpClient) {}

  list(): Observable<Collaborator[]> {
    if (this.values !== undefined) {
      return of(this.values);
    }
    const url = `${environment.apiUrl}/api/collaborators/`;
    return this.http.get<Collaborator[]>(url)
      .pipe(map(resp => {
        this.values = resp || [];
        return this.values;
      }));
  }
}
