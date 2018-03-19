import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserResolve } from '../core/resolvers/user.resolve';
import { ExpirationGuard } from '../core/services/expiration-guard.service';
import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { CityProfileComponent } from './city-profile/city-profile.component';
import { DashboardComponent } from './dashboard.component';
import { ReviewPlanComponent } from './review-plan/review-plan.component';

const routes: Routes = [
  { path: 'dashboard',
    component: DashboardComponent,
    canActivate: [ExpirationGuard, PlanAuthGuard],
    resolve: {user: UserResolve} },
  {
    path: 'city-profile',
    component: CityProfileComponent,
    canActivate: [ExpirationGuard, PlanAuthGuard]
  },
  {
    path: 'review-plan',
    component: ReviewPlanComponent,
    canActivate: [ExpirationGuard, PlanAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
