import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { ApiModule, ChartsModule } from 'climate-change-components';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { LoginFormComponent } from './marketing/login-form.component';
import { MarketingComponent } from './marketing/marketing.component';
import { NewUserFormComponent } from './marketing/new-user-form.component';
import { PageNotFoundComponent } from './not-found.component';

import { CoreModule } from './core/core.module';
import { ActionStepsModule } from './action-steps/action-steps.module';
import { AssessmentModule } from './assessment/assessment.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { SharedModule } from './shared/shared.module';

import { AccountCreateService } from './core/services/account-create.service';
import { apiHttpProvider } from './core/services/api-http.provider';
import { AuthService } from './core/services/auth.service';
import { CacheService } from './core/services/cache.service';
import { RiskService } from './core/services/risk.service';
import { UserService } from './core/services/user.service';
import { WeatherEventService } from './core/services/weather-event.service';

import {
  BsDropdownModule,
  ButtonsModule,
  CollapseModule,
  PopoverModule,
  TooltipModule,
  ModalModule,
  TypeaheadModule
 } from 'ngx-bootstrap';
import { AppRoutingModule } from './app-routing.module';

const appRoutes: Routes = [
];

@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    MarketingComponent,
    NewUserFormComponent,
    PageNotFoundComponent
  ],
  imports: [
    // Angular
    BrowserModule,
    CoreModule,
    FormsModule,
    HttpModule,
    // 3rd party
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    PopoverModule.forRoot(),
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
    apiHttpProvider,
    AuthService,
    CacheService,
    RiskService,
    UserService,
    WeatherEventService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
