import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentRoutingModule } from './assessment-routing.module';
import { SharedModule } from '../shared/shared.module';

import { AssessmentOverviewComponent } from './assessment-overview.component';
import { AdaptiveNeedBoxComponent } from './adaptive-need-box/adaptive-need-box.component';

import { CreateRiskComponent } from './create-risk.component';
import { ModalWizardModule } from '../modal-wizard/modal-wizard.module';
import { RiskWizardComponent, RiskWizardModule } from '../risk-wizard/';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';


@NgModule({
  imports: [
    CommonModule,
    ModalWizardModule.withComponents([RiskWizardComponent]),
    SharedModule,
    RiskWizardModule,
    AssessmentRoutingModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot()
  ],
  declarations: [
    AssessmentOverviewComponent,
    CreateRiskComponent,
    AdaptiveNeedBoxComponent
  ]
})
export class AssessmentModule { }
