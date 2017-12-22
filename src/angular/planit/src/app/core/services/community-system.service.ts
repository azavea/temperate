import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { CommunitySystem } from '../../shared/models/community-system.model';
import { PlanItApiHttp } from './api-http.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class CommunitySystemService {

  constructor(private apiHttp: PlanItApiHttp) {}

  list(): Observable<CommunitySystem[]> {
    const url = `${environment.apiUrl}/api/community-system/`;
    return this.apiHttp.get(url)
      .map(resp => resp.json() || [] as CommunitySystem[]);
  }

}
