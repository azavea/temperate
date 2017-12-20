import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActionStepsOverviewComponent } from './action-steps-overview.component';

const routes: Routes = [
  { path: 'actions', component: ActionStepsOverviewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionStepsRoutingModule { }

export const routedComponents = [ActionStepsOverviewComponent];
