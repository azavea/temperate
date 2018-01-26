import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { RiskService } from '../../core/services/risk.service';
import { Action } from '../../shared/';

@Injectable()
export class ActionResolve implements Resolve<Action> {

  constructor(private riskService: RiskService) { }

  resolve(route: ActivatedRouteSnapshot) {
    const riskId = route.paramMap.get('riskid');
    return this.riskService.get(riskId).map(risk => new Action(risk.action));
  }
}
