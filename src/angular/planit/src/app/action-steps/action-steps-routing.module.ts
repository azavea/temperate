import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth-guard.service';
import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { EditActionComponent } from './edit-action/edit-action.component';

const routes: Routes = [
  { path: 'actions', component: ActionStepsOverviewComponent, canActivate: [AuthGuard] },
  { path: 'actions/action/wizard', component: EditActionComponent, canActivate: [AuthGuard] },
  { path: 'actions/action/wizard/:riskid',
    component: EditActionComponent,
    canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionStepsRoutingModule { }
