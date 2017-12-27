import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentRoutingModule } from './assessment-routing.module';
import { SharedModule } from '../shared/shared.module';

import { AssessmentOverviewComponent } from './assessment-overview.component';
import { AdaptiveNeedBoxComponent } from './adaptive-need-box/adaptive-need-box.component';
import { RiskPopoverComponent } from './risk-popover/risk-popover.component';

import { CreateRiskComponent } from './create-risk.component';
import { ModalWizardModule } from '../modal-wizard/modal-wizard.module';
import { WizardModule } from '../wizard/wizard.module';
import { RiskWizardComponent, RiskWizardModule } from '../risk-wizard/';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';


@NgModule({
  imports: [
    CommonModule,
    ModalWizardModule.withComponents([RiskWizardComponent]),
    SharedModule,
    WizardModule,
    RiskWizardModule,
    AssessmentRoutingModule,
    BsDropdownModule,
    PopoverModule,
    TooltipModule
  ],
  declarations: [
    AssessmentOverviewComponent,
    CreateRiskComponent,
    AdaptiveNeedBoxComponent,
    RiskPopoverComponent
  ]
})
export class AssessmentModule { }
