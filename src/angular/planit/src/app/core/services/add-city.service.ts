import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Rx';

import { PlanItApiHttp } from '../../core/services/api-http.service';

import { User } from '../../shared/';

import { environment } from '../../../environments/environment';

@Injectable()
export class AddCityService {

  constructor(protected apiHttp: PlanItApiHttp) {}

  sendAddCityEmail(form: FormGroup): Observable<any> {
    const body = JSON.stringify({
      'city': form.controls.city.value,
      'state': form.controls.state.value,
      'notes': form.controls.notes.value
    });
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    const url = `${environment.apiUrl}/api/add_city/`;
    return this.apiHttp.post(url, body, options);
  }
}
