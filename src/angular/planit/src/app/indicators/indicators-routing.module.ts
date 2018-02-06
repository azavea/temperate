import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { IndicatorsComponent } from './indicators.component';

const routes: Routes = [
  { path: 'indicators', component: IndicatorsComponent, canActivate: [PlanAuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndicatorsRoutingModule { }
