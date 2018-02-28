import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ArchwizardModule } from 'ng2-archwizard';
import { ButtonsModule, TooltipModule, TypeaheadModule } from 'ngx-bootstrap';

import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { UserResolve } from '../core/services/user.resolve';
import { SharedModule } from '../shared/shared.module';
import { OrganizationWizardComponent } from './organization-wizard.component';
import { CityStepComponent } from './steps/city-step/city-step.component';
import { ConfirmStepComponent } from './steps/confirm-step/confirm-step.component';
import { InviteStepComponent } from './steps/invite-step/invite-step.component';
import { AddCityModalComponent } from './add-city-modal/add-city-modal.component';

const routes: Routes = [
  { path: 'create-organization',
    component: OrganizationWizardComponent,
    resolve: { user: UserResolve },
    canActivate: [PlanAuthGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ArchwizardModule,
    ButtonsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TooltipModule,
    TypeaheadModule,
  ],
  exports: [RouterModule],
  declarations: [
    CityStepComponent,
    ConfirmStepComponent,
    InviteStepComponent,
    OrganizationWizardComponent,
    AddCityModalComponent
  ]
})
export class OrganizationWizardModule { }
