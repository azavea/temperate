import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { SuggestedActionService } from '../../core/services/suggested-action.service';
import { SuggestedAction } from '../../shared/';

@Injectable()
export class SuggestedActionResolve implements Resolve<SuggestedAction> {

  constructor(private suggestedActionService: SuggestedActionService) { }

  resolve(route: ActivatedRouteSnapshot) {
    const suggestedId = route.paramMap.get('suggestedid');
    return this.suggestedActionService.get(suggestedId);
  }
}
