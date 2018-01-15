import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { RiskWizardComponent, RiskWizardModule } from '../risk-wizard/';
import { SharedModule } from '../shared/shared.module';

import { AdaptiveNeedBoxComponent } from './adaptive-need-box/adaptive-need-box.component';
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
    TooltipModule
  ],
  declarations: [
    AssessmentOverviewComponent,
    AdaptiveNeedBoxComponent,
    EditRiskComponent,
    RiskPopoverComponent
  ],
  exports: [
    AdaptiveNeedBoxComponent
  ]
})
export class AssessmentModule { }
