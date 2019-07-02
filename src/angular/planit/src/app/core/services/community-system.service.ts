import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { CommunitySystem } from '../../shared/models/community-system.model';

@Injectable()
export class CommunitySystemService {

  private values: CommunitySystem[];

  constructor(private http: HttpClient) {}

  list(): Observable<CommunitySystem[]> {
    if (this.values !== undefined) {
      return of(this.values);
    }    const url = `${environment.apiUrl}/api/community-system/`;
    return this.http.get<CommunitySystem[]>(url)
      .pipe(map(resp => {
        this.values = resp || [];
        return this.values;
      }));
  }

}
