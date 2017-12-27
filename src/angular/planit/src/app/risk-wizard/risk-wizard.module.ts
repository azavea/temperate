import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ArchwizardModule } from 'ng2-archwizard';
import { BsDropdownModule, ButtonsModule, TooltipModule, TypeaheadModule } from 'ngx-bootstrap';

import { Risk } from '../shared/models/risk.model';

import { RiskWizardComponent } from './risk-wizard.component';
import { IdentifyStepComponent } from './steps/identify-step.component';
import { HazardStepComponent } from './steps/hazard-step.component';
import { ReviewStepComponent } from './steps/review-step.component';
import { CapacityStepComponent } from './steps/capacity-step.component';
import { ImpactStepComponent } from './steps/impact-step.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BsDropdownModule,
    ButtonsModule,
    TooltipModule,
    TypeaheadModule,
    ArchwizardModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [RiskWizardComponent],
  declarations: [
    CapacityStepComponent,
    HazardStepComponent,
    IdentifyStepComponent,
    ImpactStepComponent,
    ReviewStepComponent,
    RiskWizardComponent
  ],
  providers: [],
})
export class RiskWizardModule { }
