import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExpirationGuard } from '../core/services/expiration-guard.service';
import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';

import { WeatherEventResolve } from '../core/resolvers/weather-event.resolve';
import { PreviousRouteGuard } from '../core/services/previous-route-guard.service';
import { RiskWizardComponent } from '../risk-wizard/risk-wizard.component';
import { AssessmentOverviewComponent } from './assessment-overview.component';
import { EditRiskComponent } from './edit-risk/edit-risk.component';
import { RiskResolve } from './resolvers/risk-resolve';

const routes: Routes = [
  {
    path: 'assessment',
    component: AssessmentOverviewComponent,
    canActivate: [ExpirationGuard, PlanAuthGuard],
    resolve: {
      weatherEvent: WeatherEventResolve
    }
  }, {
    path: 'assessment/risk/new',
    component: EditRiskComponent,
    canActivate: [ExpirationGuard, PlanAuthGuard, PreviousRouteGuard]
  }, {
    path: 'assessment/risk/:id',
    component: EditRiskComponent,
    resolve: {
      risk: RiskResolve
    },
    canActivate: [ExpirationGuard, PlanAuthGuard, PreviousRouteGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentRoutingModule { }
