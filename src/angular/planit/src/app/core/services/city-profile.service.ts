import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { CityProfile, CityProfileSummary, Organization } from '../../shared/';
import { PlanItApiHttp } from './api-http.service';

import { environment } from '../../../environments/environment';


@Injectable()
export class CityProfileService {

  constructor(private apiHttp: PlanItApiHttp) {}

  get(organization: Organization): Observable<CityProfile> {
    const url = `${environment.apiUrl}/api/organizations/${organization.id}/city-profile/`;
    return this.apiHttp.get(url).map(response => {
      const data = response.json();
      return new CityProfile(data);
    });
  }

  update(cityProfile: CityProfile): Observable<CityProfile> {
    const url = `${environment.apiUrl}/api/organizations/${cityProfile.organization}/city-profile/`;
    return this.apiHttp.put(url, cityProfile).map(response => {
      const data = response.json();
      return new CityProfile(data);
    });
  }
}
