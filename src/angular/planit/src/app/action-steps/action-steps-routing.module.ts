import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WeatherEventResolve } from '../core/resolvers/weather-event.resolve';
import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { PreviousRouteGuard } from '../core/services/previous-route-guard.service';
import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { EditActionComponent } from './edit-action/edit-action.component';
import { ActionResolve } from './resolvers/action-resolve';

const routes: Routes = [
  {
    path: 'actions',
    component: ActionStepsOverviewComponent,
    canActivate: [PlanAuthGuard, PreviousRouteGuard],
    resolve: {
      weatherEvent: WeatherEventResolve
    }
  }, {
    path: 'actions/action/new',
    component: EditActionComponent,
    canActivate: [PlanAuthGuard]
  }, {
    path: 'actions/action/:id',
    component: EditActionComponent,
    resolve: {
      action: ActionResolve
    },
    canActivate: [PlanAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionStepsRoutingModule { }
