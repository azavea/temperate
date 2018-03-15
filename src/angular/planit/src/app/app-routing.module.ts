import { Injectable, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { environment } from '../environments/environment';

import { UserResolve } from './core/resolvers/user.resolve';
import { ExpirationGuard } from './core/services/expiration-guard.service';
import { LoggedInAuthGuard } from './core/services/logged-in-auth-guard.service';
import { PasswordResetGuard } from './core/services/password-reset.guard';
import { PlanAuthGuard } from './core/services/plan-auth-guard.service';
import { CreatePlanComponent } from './create-plan/create-plan.component';
import { ExpirationModalComponent } from './expiration-modal/expiration-modal.component';
import { FaqComponent } from './faq/faq.component';
import { ForgotPasswordPageComponent } from './forgot-password-page/forgot-password-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ManageSubscriptionComponent } from './marketing/manage-subscription.component';
import { MarketingComponent } from './marketing/marketing.component';
import { MethodologyComponent } from './marketing/methodology.component';
import { PartnershipsComponent } from './marketing/partnerships.component';
import { PricingComponent } from './marketing/pricing.component';
import { PageNotFoundComponent } from './not-found.component';
import { OrganizationWizardComponent } from './organization-wizard/organization-wizard.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  { path: '', component: MarketingComponent, canActivate: [LoggedInAuthGuard] },
  { path: 'faq', component: FaqComponent },
  { path: 'expired', component: ExpirationModalComponent, canActivate: [ExpirationGuard] },
  {
    path: 'plan',
    component: CreatePlanComponent,
    resolve: { user: UserResolve },
    canActivate: [ExpirationGuard, PlanAuthGuard]
  },
  { path: 'methodology', component: MethodologyComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'login', component: LoginPageComponent, canActivate: [LoggedInAuthGuard] },
  {
    path: 'forgot-password',
    component: ForgotPasswordPageComponent,
    canActivate: [LoggedInAuthGuard]
  },
  { path: 'partnerships', component: PartnershipsComponent },
  { path: 'register', component: RegistrationPageComponent, canActivate: [LoggedInAuthGuard] },
  {
    path: 'reset-password/:uid/:token',
    component: ResetPasswordComponent,
    canActivate: [PasswordResetGuard, LoggedInAuthGuard]
  },
  {
    path: 'subscription',
    component: ManageSubscriptionComponent,
    canActivate: [PlanAuthGuard]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: !environment.production })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
