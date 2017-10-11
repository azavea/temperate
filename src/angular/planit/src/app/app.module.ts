import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { MarketingComponent } from './marketing/marketing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IndicatorsComponent } from './indicators/indicators.component';
import { PageNotFoundComponent } from './not-found.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';


import { ModalModule } from 'ngx-bootstrap';
import { HelpModalComponent } from './help-modal/help-modal.component';

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
    DashboardComponent,
    IndicatorsComponent,
    HelpModalComponent,
    PageNotFoundComponent,
    SidebarComponent,
    UserDropdownComponent
  ],
  imports: [
    BrowserModule,
    ModalModule.forRoot(),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: !environment.production } // <-- debugging purposes only
    ),
    BsDropdownModule.forRoot(),
  ],
  exports: [
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
