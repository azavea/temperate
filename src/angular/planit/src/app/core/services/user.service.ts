import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { User } from '../../shared/models/user.model';
import { PlanItApiHttp } from './api-http.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class UserService {

    constructor(private apiHttp: PlanItApiHttp) {}

    current(): Observable<User | null> {
        const url = `${environment.apiUrl}/api/users/current`;
        return this.apiHttp.get(url).map(resp => new User(resp.json()) || null);
    }

}
