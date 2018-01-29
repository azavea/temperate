import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { ActionService } from '../../core/services/action.service';
import { Action } from '../../shared/';

@Injectable()
export class ActionResolve implements Resolve<Action> {

  constructor(private actionService: ActionService) { }

  resolve(route: ActivatedRouteSnapshot) {
    const actionId = route.paramMap.get('id');
    return this.actionService.get(actionId);
  }
}
