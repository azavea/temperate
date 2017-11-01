import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IndicatorsComponent } from './indicators/indicators.component';
import { MarketingComponent } from './marketing/marketing.component';
import { NewUserFormComponent } from './marketing/new-user-form.component';
import { PageNotFoundComponent } from './not-found.component';


import { CoreModule } from './core/core.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { SharedModule } from './shared/shared.module';

import { AccountCreateService } from './shared/services/account-create.service';

import { ModalModule } from 'ngx-bootstrap';

const appRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'indicators', component: IndicatorsComponent },
  { path: '', component: MarketingComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    MarketingComponent,
    NewUserFormComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    DashboardModule,
    FormsModule,
    HttpModule,
    IndicatorsModule,
    ModalModule.forRoot(),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: !environment.production } // <-- debugging purposes only
    ),
    SharedModule
  ],
  exports: [
    RouterModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [
    AccountCreateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
