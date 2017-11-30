import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentRoutingModule } from './assessment-routing.module';
import { SharedModule } from '../shared/shared.module';

import { AssessmentOverviewComponent } from './assessment-overview.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AssessmentRoutingModule
  ],
  declarations: [
    AssessmentOverviewComponent
  ],
  exports: [
  ]
})
export class AssessmentModule { }
