import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth-guard.service';

import { RiskWizardComponent } from '../risk-wizard/risk-wizard.component';
import { AssessmentOverviewComponent } from './assessment-overview.component';
import { EditRiskComponent } from './edit-risk/edit-risk.component';
import { RiskResolve } from './resolvers/risk-resolve';

const routes: Routes = [
  { path: 'assessment', component: AssessmentOverviewComponent, canActivate: [AuthGuard] },
  { path: 'assessment/risk/new', component: EditRiskComponent, canActivate: [AuthGuard] },
  {
    path: 'assessment/risk/:id',
    component: EditRiskComponent,
    resolve: {
      risk: RiskResolve
    },
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentRoutingModule { }
