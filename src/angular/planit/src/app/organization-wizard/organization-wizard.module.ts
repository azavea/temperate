import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ArchwizardModule } from 'ng2-archwizard';
import { ButtonsModule, TooltipModule, TypeaheadModule } from 'ngx-bootstrap';

import { UserResolve } from '../core/resolvers/user.resolve';
import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { SharedModule } from '../shared/shared.module';
import { AddCityModalComponent } from './add-city-modal/add-city-modal.component';
import { OrganizationWizardComponent } from './organization-wizard.component';
import { CityStepComponent } from './steps/city-step/city-step.component';
import { ConfirmStepComponent } from './steps/confirm-step/confirm-step.component';
import { InviteStepComponent } from './steps/invite-step/invite-step.component';

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
    AddCityModalComponent,
    CityStepComponent,
    ConfirmStepComponent,
    InviteStepComponent,
    OrganizationWizardComponent
  ]
})
export class OrganizationWizardModule { }
