import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArchwizardModule } from 'ng2-archwizard';

import { AssessmentRoutingModule } from './assessment-routing.module';
import { SharedModule } from '../shared/shared.module';

import { AssessmentOverviewComponent } from './assessment-overview.component';
import { CreateRiskComponent } from './create-risk.component';
import { NewRiskWizardComponent } from './new-risk-wizard/new-risk-wizard.component';
import { ModalWizardModule } from '../modal-wizard/modal-wizard.module';

@NgModule({
  imports: [
    CommonModule,
    ArchwizardModule,
    ModalWizardModule,
    SharedModule,
    AssessmentRoutingModule
  ],
  declarations: [
    AssessmentOverviewComponent,
    CreateRiskComponent,
    NewRiskWizardComponent
  ],
  entryComponents: [NewRiskWizardComponent],
  exports: []
})
export class AssessmentModule { }
