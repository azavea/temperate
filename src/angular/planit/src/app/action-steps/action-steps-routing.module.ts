import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WeatherEventResolve } from '../core/resolvers/weather-event.resolve';
import { ExpirationGuard } from '../core/services/expiration-guard.service';
import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { EditActionComponent } from './edit-action/edit-action.component';
import { ActionResolve } from './resolvers/action-resolve';
import { SuggestedActionResolve } from './resolvers/suggested-action-resolve';

const routes: Routes = [
  {
    path: 'actions',
    component: ActionStepsOverviewComponent,
    canActivate: [ExpirationGuard, PlanAuthGuard],
    resolve: {
      weatherEvent: WeatherEventResolve
    }
  }, {
    path: 'actions/action/new',
    component: EditActionComponent,
    canActivate: [ExpirationGuard, PlanAuthGuard]
  }, {
    path: 'actions/action/new/:riskid',
    component: EditActionComponent,
    canActivate: [ExpirationGuard, PlanAuthGuard]
  },
  {
    path: 'actions/action/new/:riskid/:suggestedid',
    component: EditActionComponent,
    resolve: {
      suggestedAction: SuggestedActionResolve
    },
    canActivate: [ExpirationGuard, PlanAuthGuard]
  },
  {
    path: 'actions/action/:id',
    component: EditActionComponent,
    resolve: {
      action: ActionResolve
    },
    canActivate: [ExpirationGuard, PlanAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActionStepsRoutingModule { }
