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
import { MarketingComponent } from './marketing/marketing.component';
import { PageNotFoundComponent } from './not-found.component';

import { ActionStepsModule } from './action-steps/action-steps.module';
import { AssessmentModule } from './assessment/assessment.module';
import { CoreModule } from './core/core.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { SharedModule } from './shared/shared.module';

import { RiskResolve } from './assessment/resolvers/risk-resolve';
import { AccountCreateService } from './core/services/account-create.service';
import { ActionCategoryService } from './core/services/action-category.service';
import { ActionTypeService } from './core/services/action-type.service';
import { ActionService } from './core/services/action.service';
import { apiHttpProvider } from './core/services/api-http.provider';
import { AuthService } from './core/services/auth.service';
import { AuthGuard } from './core/services/auth-guard.service';
import { CacheService } from './core/services/cache.service';
import { CollaboratorService } from './core/services/collaborator.service';
import { CommunitySystemService } from './core/services/community-system.service';
import { MarketingAuthGuard } from './core/services/marketing-auth-guard.service';
import { RelatedAdaptiveValueService } from './core/services/related-adaptive-value.service';
import { RiskService } from './core/services/risk.service';
import { UserService } from './core/services/user.service';
import { WeatherEventService } from './core/services/weather-event.service';

import {
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

const appRoutes: Routes = [
];

@NgModule({
  declarations: [
    AppComponent,
    MarketingComponent,
    PageNotFoundComponent
  ],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    FormsModule,
    HttpModule,
    // 3rd party
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
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
    DashboardModule,
    IndicatorsModule,
    AppRoutingModule
  ],
  exports: [],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [
    AccountCreateService,
    ActionCategoryService,
    ActionTypeService,
    ActionService,
    apiHttpProvider,
    AuthService,
    AuthGuard,
    CacheService,
    CollaboratorService,
    CommunitySystemService,
    MarketingAuthGuard,
    RelatedAdaptiveValueService,
    RiskResolve,
    RiskService,
    UserService,
    WeatherEventService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
