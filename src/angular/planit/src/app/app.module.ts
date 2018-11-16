import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AgmCoreModule } from '@agm/core';

import {
  ApiModule,
  ChartsModule,
  ClimateModelService,
  DatasetService,
  ScenarioService
} from 'climate-change-components';

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
import { TermsOfServiceComponent } from './marketing/terms-of-service.component';
import { PageNotFoundComponent } from './not-found.component';

import { ActionStepsModule } from './action-steps/action-steps.module';
import { AssessmentModule } from './assessment/assessment.module';
import { CoreModule } from './core/core.module';
import { CreatePlanModule } from './create-plan/create-plan.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExpirationModalComponent } from './expiration-modal/expiration-modal.component';
import { FaqComponent } from './faq/faq.component';
import { IndicatorsModule } from './indicators/indicators.module';
import { OrganizationWizardModule } from './organization-wizard/organization-wizard.module';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';

import { ActionResolve } from './action-steps/resolvers/action-resolve';
import { SuggestedActionResolve } from './action-steps/resolvers/suggested-action-resolve';
import { RiskResolve } from './assessment/resolvers/risk-resolve';
import { UserResolve } from './core/resolvers/user.resolve';
import { WeatherEventResolve } from './core/resolvers/weather-event.resolve';
import { AccountCreateService } from './core/services/account-create.service';
import { ActionCategoryService } from './core/services/action-category.service';
import { ActionTypeService } from './core/services/action-type.service';
import { ActionService } from './core/services/action.service';
import { AddCityService } from './core/services/add-city.service';
import { apiHttpProvider } from './core/services/api-http.provider';
import { AuthGuard } from './core/services/auth-guard.service';
import { AuthService } from './core/services/auth.service';
import { CacheService } from './core/services/cache.service';
import { CityProfileService } from './core/services/city-profile.service';
import { CollaboratorService } from './core/services/collaborator.service';
import { CommunitySystemService } from './core/services/community-system.service';
import { DownloadService } from './core/services/download.service';
import { ExpirationGuard } from './core/services/expiration-guard.service';
import { InviteUserService } from './core/services/invite-user.service';
import { LoggedInAuthGuard } from './core/services/logged-in-auth-guard.service';
import { OrganizationService } from './core/services/organization.service';
import { PasswordResetGuard } from './core/services/password-reset.guard';
import { PlanAuthGuard } from './core/services/plan-auth-guard.service';
import { PlanService } from './core/services/plan.service';
import { PreviousRouteGuard } from './core/services/previous-route-guard.service';
import { RelatedAdaptiveValueService } from './core/services/related-adaptive-value.service';
import { RiskService } from './core/services/risk.service';
import { SuggestedActionService } from './core/services/suggested-action.service';
import { UserService } from './core/services/user.service';
import { WeatherEventService } from './core/services/weather-event.service';

import {
  AccordionModule,
  AlertModule,
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
import { ForgotPasswordPageComponent } from './forgot-password-page/forgot-password-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


const AGM_CONFIG = {
  apiKey: environment.googleMapsApiKey,
  libraries: ['places']
};


@NgModule({
  declarations: [
    AppComponent,
    ExpirationModalComponent,
    FaqComponent,
    ForgotPasswordPageComponent,
    ManageSubscriptionComponent,
    LoginPageComponent,
    ManageSubscriptionComponent,
    MarketingComponent,
    MethodologyComponent,
    PageNotFoundComponent,
    PartnershipsComponent,
    PlanSelectorComponent,
    PricingComponent,
    RegistrationPageComponent,
    ResetPasswordComponent,
    TermsOfServiceComponent,
  ],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    FormsModule,
    HttpModule,
    // 3rd party
    AccordionModule.forRoot(),
    AgmCoreModule.forRoot(AGM_CONFIG),
    AlertModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    OrganizationWizardModule,
    PopoverModule.forRoot(),
    ProgressbarModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
    }),
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
    AddCityService,
    apiHttpProvider,
    AuthService,
    AuthGuard,
    CacheService,
    CityProfileService,
    CollaboratorService,
    CommunitySystemService,
    DownloadService,
    ExpirationGuard,
    InviteUserService,
    LoggedInAuthGuard,
    OrganizationService,
    PasswordResetGuard,
    PlanAuthGuard,
    PlanService,
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
export class AppModule {
  constructor (private userService: UserService,
               private datasetService: DatasetService,
               private scenarioService: ScenarioService,
               private modelService: ClimateModelService) {
      this.userService.currentUser.first().subscribe(() => {
        // Issue an eager request for indicator static configuration data so it's already cached if
        // the user opens an indicator chart
        this.datasetService.list().subscribe();
        this.scenarioService.list().subscribe();
        this.modelService.list().subscribe();
      });

  }
}
