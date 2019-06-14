import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { CommunitySystem } from '../../shared/models/community-system.model';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class CommunitySystemService {

  private values: CommunitySystem[];

  constructor(private apiHttp: PlanItApiHttp) {}

  list(): Observable<CommunitySystem[]> {
    if (this.values !== undefined) {
      return Observable.of(this.values);
    }    const url = `${environment.apiUrl}/api/community-system/`;
    return this.apiHttp.get(url)
      .pipe(map(resp => {
        this.values = resp.json() || [] as CommunitySystem[];
        return this.values;
      }));
  }

}
