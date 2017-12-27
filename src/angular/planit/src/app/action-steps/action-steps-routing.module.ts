import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { CreateActionComponent } from './create-action.component';

const routes: Routes = [
  { path: 'actions', component: ActionStepsOverviewComponent },
  { path: 'actions/action/wizard', component: CreateActionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionStepsRoutingModule { }
