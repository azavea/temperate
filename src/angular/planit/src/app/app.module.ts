import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { ApiModule, ChartsModule } from 'climate-change-components';

import { ToastrModule } from 'ngx-toastr';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ManageSubscriptionComponent } from './marketing/manage-subscription.component';
import { MarketingComponent } from './marketing/marketing.component';
import { MethodologyComponent } from './marketing/methodology.component';
import { PartnershipsComponent } from './marketing/partnerships.component';
import { PlanSelectorComponent } from './marketing/plan-selector.component';
import { PricingComponent } from './marketing/pricing.component';
import { PageNotFoundComponent } from './not-found.component';

import { ActionStepsModule } from './action-steps/action-steps.module';
import { AssessmentModule } from './assessment/assessment.module';
import { CoreModule } from './core/core.module';
import { CreatePlanModule } from './create-plan/create-plan.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { OrganizationWizardModule } from './organization-wizard/organization-wizard.module';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';

import { ActionResolve } from './action-steps/resolvers/action-resolve';
import { SuggestedActionResolve } from './action-steps/resolvers/suggested-action-resolve';
import { RiskResolve } from './assessment/resolvers/risk-resolve';
import { WeatherEventResolve } from './core/resolvers/weather-event.resolve';
import { AccountCreateService } from './core/services/account-create.service';
import { ActionCategoryService } from './core/services/action-category.service';
import { ActionTypeService } from './core/services/action-type.service';
import { ActionService } from './core/services/action.service';
import { apiHttpProvider } from './core/services/api-http.provider';
import { AuthGuard } from './core/services/auth-guard.service';
import { AuthService } from './core/services/auth.service';
import { CacheService } from './core/services/cache.service';
import { CityProfileService } from './core/services/city-profile.service';
import { CityService } from './core/services/city.service';
import { CollaboratorService } from './core/services/collaborator.service';
import { CommunitySystemService } from './core/services/community-system.service';
import { DownloadService } from './core/services/download.service';
import { LoggedInAuthGuard } from './core/services/logged-in-auth-guard.service';
import { OrganizationService } from './core/services/organization.service';
import { PlanAuthGuard } from './core/services/plan-auth-guard.service';
import { PreviousRouteGuard } from './core/services/previous-route-guard.service';
import { RelatedAdaptiveValueService } from './core/services/related-adaptive-value.service';
import { RiskService } from './core/services/risk.service';
import { SuggestedActionService } from './core/services/suggested-action.service';
import { UserResolve } from './core/resolvers/user.resolve';
import { UserService } from './core/services/user.service';
import { WeatherEventService } from './core/services/weather-event.service';

import {
  BsDatepickerModule,
  BsDropdownModule,
  ButtonsModule,
  CollapseModule,
  ModalModule,
  PopoverModule,
  ProgressbarModule,
  TooltipModule,
  TypeaheadModule
 } from 'ngx-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { ForgotPasswordPageComponent } from './forgot-password-page/forgot-password-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
  declarations: [
    AppComponent,
    ManageSubscriptionComponent,
    LoginPageComponent,
    MarketingComponent,
    MethodologyComponent,
    PageNotFoundComponent,
    PartnershipsComponent,
    PlanSelectorComponent,
    PricingComponent,
    RegistrationPageComponent,
    ForgotPasswordPageComponent,
    ResetPasswordComponent
  ],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    FormsModule,
    HttpModule,
    // 3rd party
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    OrganizationWizardModule,
    PopoverModule.forRoot(),
    ProgressbarModule.forRoot(),
    ToastrModule.forRoot(),
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
    // Local
    SharedModule,
    ApiModule.forRoot({
      apiHost: environment.apiUrl + '/api/climate-api',
      apiHttpInjectionToken: apiHttpProvider.provide
    }),
    ChartsModule,
    ActionStepsModule,
    AssessmentModule,
    CreatePlanModule,
    DashboardModule,
    IndicatorsModule,
    SettingsModule,
    AppRoutingModule
  ],
  exports: [],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [
    AccountCreateService,
    ActionCategoryService,
    ActionTypeService,
    ActionResolve,
    ActionService,
    apiHttpProvider,
    AuthService,
    AuthGuard,
    CacheService,
    CityProfileService,
    CityService,
    CollaboratorService,
    CommunitySystemService,
    DownloadService,
    LoggedInAuthGuard,
    OrganizationService,
    PlanAuthGuard,
    PreviousRouteGuard,
    RelatedAdaptiveValueService,
    RiskResolve,
    RiskService,
    SuggestedActionResolve,
    SuggestedActionService,
    UserResolve,
    UserService,
    WeatherEventResolve,
    WeatherEventService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
