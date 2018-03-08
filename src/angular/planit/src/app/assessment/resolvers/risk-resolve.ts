import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { RiskService } from '../../core/services/risk.service';
import { Risk } from '../../shared/';

@Injectable()
export class RiskResolve implements Resolve<Risk> {

  constructor(private riskService: RiskService) { }

  resolve(route: ActivatedRouteSnapshot) {
    const riskId = route.paramMap.get('id');
    return this.riskService.get(riskId);
  }
}
