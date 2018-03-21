import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  AlertModule,
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
import { ActionCardContainerComponent } from './action-card-container/action-card-container.component';


@NgModule({
  imports: [
    AlertModule,
    CommonModule,
    ProgressbarModule,
    BsDropdownModule,
    TooltipModule,
    SharedModule,
    ActionStepsRoutingModule,
    ActionWizardModule,
    AssessmentModule
  ],
  declarations: [
    ActionCardContainerComponent,
    ActionPickerComponent,
    ActionStepsOverviewComponent,
    ActionCardComponent,
    EditActionComponent,
    RiskCardComponent,
  ],
  exports: [
    ActionCardContainerComponent,
  ],
  providers: [],
})
export class ActionStepsModule { }
