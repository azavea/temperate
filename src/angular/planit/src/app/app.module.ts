import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { MarketingComponent } from './marketing/marketing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IndicatorsComponent } from './indicators/indicators.component';
import { PageNotFoundComponent } from './not-found.component';

import { CoreModule } from './core/core.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { SharedModule } from './shared/shared.module';

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
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    DashboardModule,
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
