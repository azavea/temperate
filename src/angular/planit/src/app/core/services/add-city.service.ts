import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { PlanItApiHttp } from '../../core/services/api-http.service';

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
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${environment.apiUrl}/api/add_city/`;
    return this.apiHttp.post(url, body, {headers: headers});
  }
}
