import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  BsDropdownModule,
  ProgressbarModule,
  TooltipModule
} from 'ngx-bootstrap';

import {
  ActionWizardComponent,
  ActionWizardModule
} from '../action-wizard';
import { AssessmentModule } from '../assessment/assessment.module';
import { SharedModule } from '../shared/shared.module';

import { ActionCardComponent } from './action-card/action-card.component';
import { ActionPickerComponent } from './action-picker/action-picker.component';
import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { ActionStepsRoutingModule } from './action-steps-routing.module';
import { EditActionComponent } from './edit-action/edit-action.component';
import { RiskCardComponent } from './risk-card/risk-card.component';


@NgModule({
  imports: [
    CommonModule,
    ProgressbarModule,
    BsDropdownModule,
    TooltipModule,
    SharedModule,
    ActionStepsRoutingModule,
    ActionWizardModule,
    AssessmentModule
  ],
  exports: [],
  declarations: [
    ActionPickerComponent,
    ActionStepsOverviewComponent,
    ActionCardComponent,
    EditActionComponent,
    RiskCardComponent
  ],
  providers: [],
})
export class ActionStepsModule { }
