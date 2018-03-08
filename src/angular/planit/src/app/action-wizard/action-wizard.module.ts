import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ArchwizardModule } from 'ng2-archwizard';
import {
  PopoverModule,
  TooltipModule,
  TypeaheadModule
} from 'ngx-bootstrap';

import { SharedModule } from '../shared/shared.module';
import { ActionWizardComponent } from './action-wizard.component';
import { AssessStepComponent } from './steps/assess-step/assess-step.component';
import { CategoryStepComponent } from './steps/category-step/category-step.component';
import { FundingStepComponent } from './steps/funding-step/funding-step.component';
import {
  ImplementationStepComponent
} from './steps/implementation-step/implementation-step.component';
import { ImprovementsStepComponent } from './steps/improvements-step/improvements-step.component';
import { ReviewStepComponent } from './steps/review-step/review-step.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TooltipModule,
    TypeaheadModule,
    ArchwizardModule,
    PopoverModule,
    ReactiveFormsModule
  ],
  exports: [ ActionWizardComponent ],
  declarations: [
    ActionWizardComponent,
    AssessStepComponent,
    ImprovementsStepComponent,
    CategoryStepComponent,
    FundingStepComponent,
    ReviewStepComponent,
    ImplementationStepComponent
  ]
})
export class ActionWizardModule { }
