import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PopoverModule, ProgressbarModule, TooltipModule } from 'ngx-bootstrap';

import { SharedModule } from '../shared/shared.module';

import {
  CityProfileSummaryComponent
} from './city-profile-summary/city-profile-summary.component';
import { CityProfileComponent } from './city-profile/city-profile.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { GroupedRiskComponent } from './grouped-risk/grouped-risk.component';

@NgModule({
  imports: [
    CommonModule,
    PopoverModule,
    ProgressbarModule,
    TooltipModule,
    SharedModule,
    DashboardRoutingModule
  ],
  declarations: [
    CityProfileComponent,
    CityProfileSummaryComponent,
    DashboardComponent,
    GroupedRiskComponent
  ],
  exports: [ ],
  schemas: [ ]
})
export class DashboardModule { }
