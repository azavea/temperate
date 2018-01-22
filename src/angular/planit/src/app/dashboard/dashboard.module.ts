import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { ProgressbarModule, TooltipModule } from 'ngx-bootstrap';

import { SharedModule } from '../shared/shared.module';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { GroupedRiskComponent } from './grouped-risk/grouped-risk.component';

@NgModule({
  imports: [
    CommonModule,
    ProgressbarModule,
    TooltipModule,
    SharedModule,
    DashboardRoutingModule
  ],
  declarations: [
    DashboardComponent,
    GroupedRiskComponent
  ],
  exports: [
    DashboardComponent,
    GroupedRiskComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class DashboardModule { }
