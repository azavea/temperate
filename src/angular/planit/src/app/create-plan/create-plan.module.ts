import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  BsDropdownModule,
  ProgressbarModule,
  TooltipModule
} from 'ngx-bootstrap';

import { SharedModule } from '../shared/shared.module';

import { CreatePlanComponent } from './create-plan.component';
import {
  PlanWizardComponent,
  PlanWizardModule
} from './plan-wizard';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PlanWizardModule
  ],
  exports: [],
  declarations: [
    CreatePlanComponent
  ],
  providers: [],
})
export class CreatePlanModule { }
