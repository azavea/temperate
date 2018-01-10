import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssessmentOverviewComponent } from './assessment-overview.component';
import { EditRiskComponent } from './edit-risk/edit-risk.component';
import { RiskWizardComponent } from '../risk-wizard/risk-wizard.component';
import { RiskResolve } from './resolvers/risk-resolve';

const routes: Routes = [
  { path: 'assessment', component: AssessmentOverviewComponent },
  { path: 'assessment/risk/new', component: EditRiskComponent },
  {
    path: 'assessment/risk/:id',
    component: EditRiskComponent,
    resolve: {
      risk: RiskResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentRoutingModule { }
