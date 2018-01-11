import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { CommunitySystem } from '../../shared/models/community-system.model';
import { PlanItApiHttp } from './api-http.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class CommunitySystemService {

  private values: CommunitySystem[];

  constructor(private apiHttp: PlanItApiHttp) {}

  list(): Observable<CommunitySystem[]> {
    if (this.values !== undefined) {
      return Observable.of(this.values);
    }    const url = `${environment.apiUrl}/api/community-system/`;
    return this.apiHttp.get(url)
      .map(resp => {
        this.values = resp.json() || [] as CommunitySystem[];
        return this.values;
      });
  }

}
