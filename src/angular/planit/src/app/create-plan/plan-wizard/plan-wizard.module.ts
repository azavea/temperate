import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ArchwizardModule } from 'ng2-archwizard';
import { BsDatepickerModule, TooltipModule } from 'ngx-bootstrap';

import { SharedModule } from '../../shared/shared.module';
import { PlanWizardComponent } from './plan-wizard.component';
// tslint:disable-next-line:max-line-length
import { CommunitySystemsStepComponent } from './steps/community-systems-step/community-systems-step.component';
import { DueDateStepComponent } from './steps/due-date-step/due-date-step.component';
import { HazardsStepComponent } from './steps/hazards-step/hazards-step.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    TooltipModule,
    ArchwizardModule,
    BsDatepickerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    PlanWizardComponent
  ],
  declarations: [
    CommunitySystemsStepComponent,
    DueDateStepComponent,
    HazardsStepComponent,
    PlanWizardComponent
  ],
  providers: [],
})
export class PlanWizardModule { }
