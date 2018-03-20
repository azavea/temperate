import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  AccordionModule,
  PopoverModule,
  ProgressbarModule,
  TooltipModule,
  TypeaheadModule
} from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { SharedModule } from '../shared/shared.module';
import { AssessmentModule } from '../assessment/assessment.module';

import {
  CityProfileSummaryComponent
} from './city-profile-summary/city-profile-summary.component';
import { CityProfileComponent } from './city-profile/city-profile.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { GroupedRiskComponent } from './grouped-risk/grouped-risk.component';
import { ReviewPlanComponent } from './review-plan/review-plan.component';
import { AdaptationReviewComponent } from './review-plan/tabs/adaptation-review.component';
import { PlanSummaryComponent } from './review-plan/tabs/plan-summary.component';

@NgModule({
  imports: [
    CommonModule,
    AssessmentModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AccordionModule,
    PopoverModule,
    ProgressbarModule,
    TabsModule,
    TooltipModule,
    ToastrModule,
    TypeaheadModule,
    SharedModule,
  ],
  declarations: [
    AdaptationReviewComponent,
    CityProfileComponent,
    CityProfileSummaryComponent,
    DashboardComponent,
    GroupedRiskComponent,
    PlanSummaryComponent,
    ReviewPlanComponent
  ],
  exports: [ ],
  schemas: [ ]
})
export class DashboardModule { }
