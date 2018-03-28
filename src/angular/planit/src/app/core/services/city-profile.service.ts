import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { CityProfile, CityProfileOption, CityProfileSummary, Organization } from '../../shared/';
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

  // BEGIN list methods for all available city profile option endpoints

  listEconomicSectors() {
    const url = `${environment.apiUrl}/api/city-profile-options/economic-sectors/`;
    return this.apiHttp.get(url).map(response => response.json() as CityProfileOption[]);
  }

  listCommitmentStatuses() {
    const url = `${environment.apiUrl}/api/city-profile-options/commitment-status/`;
    return this.apiHttp.get(url).map(response => response.json() as CityProfileOption[]);
  }

  listSectionStatuses() {
    const url = `${environment.apiUrl}/api/city-profile-options/section-status/`;
    return this.apiHttp.get(url).map(response => response.json() as CityProfileOption[]);
  }

  // END list methods for all available city profile option endpoints
}
