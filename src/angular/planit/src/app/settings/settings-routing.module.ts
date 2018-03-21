import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExpirationGuard } from '../core/services/expiration-guard.service';
import { PlanAuthGuard } from '../core/services/plan-auth-guard.service';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
  { path: 'settings', component: SettingsComponent, canActivate: [ExpirationGuard, PlanAuthGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
