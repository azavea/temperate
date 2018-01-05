import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActionWizardComponent,
         ActionWizardModule } from '../action-wizard';
import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { ActionStepsRoutingModule } from './action-steps-routing.module';
import { CreateActionComponent } from './create-action.component';
import { ModalWizardModule } from '../modal-wizard/modal-wizard.module';
import { SharedModule } from '../shared/shared.module';
import { ActionCardComponent } from './action-card/action-card.component';

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
    CreateActionComponent,
    ActionCardComponent
  ],
  providers: [],
})
export class ActionStepsModule { }
