import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  BsDropdownModule,
  PopoverModule,
  ProgressbarModule,
  TooltipModule
} from 'ngx-bootstrap';

import { RiskWizardComponent, RiskWizardModule } from '../risk-wizard/';
import { SharedModule } from '../shared/shared.module';

import { AssessmentOverviewComponent } from './assessment-overview.component';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { EditRiskComponent } from './edit-risk/edit-risk.component';
import { RiskPopoverComponent } from './risk-popover/risk-popover.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RiskWizardModule,
    AssessmentRoutingModule,
    BsDropdownModule,
    PopoverModule,
    ProgressbarModule,
    TooltipModule
  ],
  declarations: [
    AssessmentOverviewComponent,
    EditRiskComponent,
    RiskPopoverComponent
  ]
})
export class AssessmentModule { }
