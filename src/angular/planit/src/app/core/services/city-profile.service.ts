import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CityProfile, CityProfileOption, CityProfileSummary, Organization } from '../../shared/';

import { environment } from '../../../environments/environment';


@Injectable()
export class CityProfileService {

  constructor(private http: HttpClient) {}

  get(organization: Organization): Observable<CityProfile> {
    const url = `${environment.apiUrl}/api/organizations/${organization.id}/city-profile/`;
    return this.http.get(url).pipe(map(response => new CityProfile(response)));
  }

  update(cityProfile: CityProfile): Observable<CityProfile> {
    const url = `${environment.apiUrl}/api/organizations/${cityProfile.organization}/city-profile/`;
    return this.http.put(url, cityProfile).pipe(map(response => new CityProfile(response)));
  }

  listOptions(): Observable<{[key: string]: CityProfileOption[]}> {
    const url = `${environment.apiUrl}/api/city-profile-options/`;
    return this.http.get<{[key: string]: CityProfileOption[]}>(url);
  }
}
