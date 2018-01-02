import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ArchwizardModule } from 'ng2-archwizard';
import { BsDropdownModule, ButtonsModule, TooltipModule, TypeaheadModule } from 'ngx-bootstrap';

import { RiskWizardComponent } from './risk-wizard.component';
import { CapacityStepComponent } from './steps/capacity-step/capacity-step.component';
import { HazardStepComponent } from './steps/hazard-step/hazard-step.component';
import { IdentifyStepComponent } from './steps/identify-step/identify-step.component';
import { ImpactStepComponent } from './steps/impact-step/impact-step.component';
import { ReviewStepComponent } from './steps/review-step/review-step.component';
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
