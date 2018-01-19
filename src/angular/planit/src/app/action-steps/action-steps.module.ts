import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgressbarModule,
         TooltipModule,
         BsDropdownModule } from 'ngx-bootstrap';

import {
  ActionWizardComponent,
  ActionWizardModule
} from '../action-wizard';
import { AssessmentModule } from '../assessment/assessment.module';
import { SharedModule } from '../shared/shared.module';

import { ActionPickerComponent } from './action-picker/action-picker.component';
import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { ActionStepsRoutingModule } from './action-steps-routing.module';
import { ActionCardComponent } from './action-card/action-card.component';
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
