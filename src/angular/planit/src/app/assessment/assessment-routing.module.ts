import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {AssessmentOverviewComponent } from './assessment-overview.component';
import { CreateRiskComponent } from './create-risk.component';

const routes: Routes = [
  { path: 'assessment', component: AssessmentOverviewComponent },
  { path: 'assessment/risk/wizard', component: CreateRiskComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssessmentRoutingModule { }
