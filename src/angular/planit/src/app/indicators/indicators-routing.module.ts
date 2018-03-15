import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExpirationGuard } from '../core/services/expiration-guard.service';
import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { IndicatorsComponent } from './indicators.component';

const routes: Routes = [
  {
    path: 'indicators',
    component: IndicatorsComponent,
    canActivate: [ExpirationGuard, PlanAuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndicatorsRoutingModule { }
