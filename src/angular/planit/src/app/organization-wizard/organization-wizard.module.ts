import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ArchwizardModule } from 'ng2-archwizard';
import { ButtonsModule, TooltipModule, TypeaheadModule } from 'ngx-bootstrap';

import { SharedModule } from '../shared/shared.module';
import { OrganizationWizardComponent } from './organization-wizard.component';
import { CityStepComponent } from './steps/city-step/city-step.component';
import { InviteStepComponent } from './steps/invite-step/invite-step.component';
import { ConfirmStepComponent } from './steps/confirm-step/confirm-step.component';

const routes: Routes = [
  { path: 'create-organization', component: OrganizationWizardComponent }
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
    OrganizationWizardComponent
  ]
})
export class OrganizationWizardModule { }
