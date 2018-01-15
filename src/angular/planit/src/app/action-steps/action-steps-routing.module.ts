import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActionPickerPromptComponent } from './action-picker/action-picker-prompt.component';
import { ActionStepsOverviewComponent } from './action-steps-overview.component';
import { ActionWizardComponent } from '../action-wizard/action-wizard.component';
import { EditActionComponent } from './edit-action/edit-action.component';

const routes: Routes = [
  { path: 'actions', component: ActionStepsOverviewComponent },
  { path: 'actions/action/start', component: ActionPickerPromptComponent },
  { path: 'actions/action/wizard', component: EditActionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionStepsRoutingModule { }
