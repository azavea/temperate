import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable()
export class AddCityService {

  constructor(protected http: HttpClient) {}

  sendAddCityEmail(form: FormGroup): Observable<any> {
    const body = JSON.stringify({
      'city': form.controls.city.value,
      'state': form.controls.state.value,
      'notes': form.controls.notes.value
    });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${environment.apiUrl}/api/add_city/`;
    return this.http.post(url, body, {headers: headers});
  }
}
