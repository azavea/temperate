import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

import {
  ActionWizardComponent,
  ActionWizardModule
} from '../action-wizard';
import { SharedModule } from '../shared/shared.module';

import { ActionPickerPromptComponent } from './action-picker/action-picker-prompt.component';
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
    ActionWizardModule
  ],
  exports: [],
  declarations: [
    ActionPickerPromptComponent,
    ActionStepsOverviewComponent,
    ActionCardComponent,
    EditActionComponent
  ],
  providers: [],
})
export class ActionStepsModule { }
