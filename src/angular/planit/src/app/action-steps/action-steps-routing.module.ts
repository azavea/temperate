import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth-guard.service';
import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { EditActionComponent } from './edit-action/edit-action.component';
import { ActionResolve } from './resolvers/action-resolve';

const routes: Routes = [
  { path: 'actions', component: ActionStepsOverviewComponent, canActivate: [AuthGuard] },
  { path: 'actions/action/new', component: EditActionComponent, canActivate: [AuthGuard] },
  {
    path: 'actions/action/:riskid',
    component: EditActionComponent,
    resolve: {
      action: ActionResolve
    },
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionStepsRoutingModule { }
