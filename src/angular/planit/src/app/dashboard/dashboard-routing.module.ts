import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { PreviousRouteGuard } from '../core/services/previous-route-guard.service';
import { UserResolve } from '../core/services/user.resolve';
import { CityProfileComponent } from './city-profile/city-profile.component';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [PlanAuthGuard],
    resolve: {user: UserResolve} },
  {
    path: 'city-profile',
    component: CityProfileComponent,
    canActivate: [PlanAuthGuard, PreviousRouteGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
