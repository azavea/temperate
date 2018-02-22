import { Injectable, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { environment } from '../environments/environment';

import { MarketingAuthGuard } from './core/services/marketing-auth-guard.service';
import { PlanAuthGuard } from './core/services/plan-auth-guard.service';
import { PreviousRouteGuard } from './core/services/previous-route-guard.service';
import { UserResolve } from './core/services/user.resolve';
import { CreatePlanComponent } from './create-plan/create-plan.component';
import { ManageSubscriptionComponent } from './marketing/manage-subscription.component';
import { MarketingComponent } from './marketing/marketing.component';
import { MethodologyComponent } from './marketing/methodology.component';
import { PageNotFoundComponent } from './not-found.component';
import { OrganizationWizardComponent } from './organization-wizard/organization-wizard.component';

const routes: Routes = [
  { path: 'reset-password/:token', component: MarketingComponent},
  { path: '', component: MarketingComponent, canActivate: [MarketingAuthGuard] },
  {
    path: 'plan',
    component: CreatePlanComponent,
    resolve: { user: UserResolve },
    canActivate: [PlanAuthGuard]
  },
  { path: 'methodology', component: MethodologyComponent, canActivate: [PreviousRouteGuard] },
  {
    path: 'subscription',
    component: ManageSubscriptionComponent,
    canActivate: [PreviousRouteGuard]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: !environment.production })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
