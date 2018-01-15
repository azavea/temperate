import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

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


@NgModule({
  imports: [
    CommonModule,
    ProgressbarModule,
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
    EditActionComponent
  ],
  providers: [],
})
export class ActionStepsModule { }
