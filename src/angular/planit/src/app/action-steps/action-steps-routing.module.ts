import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { EditActionComponent } from './edit-action/edit-action.component';
import { ActionResolve } from './resolvers/action-resolve';
import { SuggestedActionResolve } from './resolvers/suggested-action-resolve';

const routes: Routes = [
  { path: 'actions', component: ActionStepsOverviewComponent, canActivate: [PlanAuthGuard] },
  { path: 'actions/action/new', component: EditActionComponent, canActivate: [PlanAuthGuard] },
  {
    path: 'actions/action/new/:riskid',
    component: EditActionComponent,
    canActivate: [PlanAuthGuard]
  },
  {
    path: 'actions/action/new/:riskid/:suggestedid',
    component: EditActionComponent,
    resolve: {
      suggestedAction: SuggestedActionResolve
    },
    canActivate: [PlanAuthGuard]
  },
  {
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
