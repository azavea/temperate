import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { User } from '../../shared/models/user.model';
import { UserService } from './user.service';

// Get the current user before the route loads
@Injectable()
export class UserResolve implements Resolve<User> {
  constructor(private userService: UserService) {}
  resolve(): Observable<User> {
    return this.userService.current();
  }
}