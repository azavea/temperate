import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActionStepsRoutingModule } from './action-steps-routing.module';
import { SharedModule } from '../shared/shared.module';

import { ActionStepsOverviewComponent } from './action-steps-overview.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ActionStepsRoutingModule
  ],
  exports: [],
  declarations: [ActionStepsOverviewComponent],
  providers: [],
})
export class ActionStepsModule { }
