import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Rx';

import { User } from '../../shared/';

import { environment } from '../../../environments/environment';

@Injectable()
export class AddCityService {

  constructor(protected http: Http) {}

  sendAddCityEmail(form: any, user: User): Observable<any> {
    // TODO: figure out the input type
    const body = JSON.stringify({
      'email': user.email,
      'first_name': user.first_name,
      'last_name': user.last_name,
      'city': form.controls.city.value,
      'state': form.controls.state.value,
      'subject': form.controls.subject.value,
      'description': form.controls.description.value
    });
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    const url = `${environment.apiUrl}/add_city/`;
    return this.http.post(url, body, options);
  }
}
