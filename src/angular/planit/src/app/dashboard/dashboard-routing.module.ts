import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserResolve } from '../core/resolvers/user.resolve';
import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { CityProfileComponent } from './city-profile/city-profile.component';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [PlanAuthGuard],
    resolve: {user: UserResolve} },
  {
    path: 'city-profile',
    component: CityProfileComponent,
    canActivate: [PlanAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
