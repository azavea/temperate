import { Injectable, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { environment } from '../environments/environment';

import { MarketingAuthGuard } from './core/services/marketing-auth-guard.service';
import { PlanAuthGuard } from './core/services/plan-auth-guard.service';
import { UserResolve } from './core/services/user.resolve';
import { CreatePlanComponent } from './create-plan/create-plan.component';
import { OrganizationWizardComponent } from './organization-wizard/organization-wizard.component';
import { MarketingComponent } from './marketing/marketing.component';
import { PageNotFoundComponent } from './not-found.component';

const routes: Routes = [
  {
    path: 'plan',
    component: CreatePlanComponent,
    resolve: { user: UserResolve },
    canActivate: [PlanAuthGuard]
  },
  { path: '', component: MarketingComponent, canActivate: [MarketingAuthGuard] },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: !environment.production })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
