import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable } from 'rxjs';

import { APICacheService } from 'climate-change-components';
import { environment } from '../../../environments/environment';
import { Organization } from '../../shared';
import { PlanItApiHttp } from './api-http.service';
import { UserService } from './user.service';

@Injectable()
export class OrganizationService {

  constructor(private apiHttp: PlanItApiHttp,
              private userService: UserService,
              private cache: APICacheService) {}

  private formatOrganization(organization: Organization): any {
    const formattedOrganization = cloneDeep(organization);
    if (organization.plan_due_date) {
      // API expects date with no time portion, in ISO format (yyyy-mm-dd)
      formattedOrganization.plan_due_date = organization.plan_due_date.toISOString().substr(0, 10);
    }
    return Object.assign(formattedOrganization, {});
  }

  create(organization: Organization): Observable<Organization> {
    const url = `${environment.apiUrl}/api/organizations/`;
    return this.apiHttp.post(url, this.formatOrganization(organization)).map(resp => {
      organization = new Organization(resp.json());
      this.userService.invalidate();
      return organization;
    });
  }

  update(organization: Organization): Observable<Organization> {
    const url = `${environment.apiUrl}/api/organizations/${organization.id}/`;
    // PATCH instead of PUT here to avoid errors regarding required fields that are already set
    return this.apiHttp.patch(url, this.formatOrganization(organization)).map(resp => {
      organization = new Organization(resp.json());
      this.userService.invalidate();
      return organization;
    });
  }
}
