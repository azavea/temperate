import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import { Observable } from 'rxjs/Rx';

import { Indicator, IndicatorService } from 'climate-change-components';

import { environment } from '../../../environments/environment';
import { Organization } from '../../shared/models/organization.model';
import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class OrganizationService {

  constructor(private apiHttp: PlanItApiHttp) {}

  private formatOrganization(organization: Organization): any {
    const formattedOrganization = cloneDeep(organization);
    if (organization.plan_due_date) {
      // API expects date in ISO format
      const datePipe = new DatePipe('en-US');
      formattedOrganization.plan_due_date = datePipe.transform(organization.plan_due_date,
                                                               'yyyy-M-d');
    }
    return Object.assign(formattedOrganization, {});
  }

  create(organization: Organization): Observable<Organization> {
    const url = `${environment.apiUrl}/api/organizations/`;
    return this.apiHttp.post(url, this.formatOrganization(organization)).map(resp => {
      return new Organization(resp.json());
    });
  }

  update(organization: Organization): Observable<Organization> {
    const url = `${environment.apiUrl}/api/organizations/${organization.id}/`;
    // PATCH instead of PUT here to avoid errors regarding required fields that are already set
    return this.apiHttp.patch(url, this.formatOrganization(organization)).map(resp => {
      return new Organization(resp.json());
    });
  }
}
