import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActionStepsRoutingModule } from './action-steps-routing.module';
import { SharedModule } from '../shared/shared.module';

import { CreateActionComponent } from './create-action.component';
import { ModalWizardModule } from '../modal-wizard/modal-wizard.module';
import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { ActionWizardComponent, ActionWizardModule } from '../action-wizard';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ActionStepsRoutingModule,
    ActionWizardModule,
    ModalWizardModule.withComponents([ActionWizardComponent])
  ],
  exports: [],
  declarations: [
    ActionStepsOverviewComponent,
    CreateActionComponent
  ],
  providers: [],
})
export class ActionStepsModule { }
