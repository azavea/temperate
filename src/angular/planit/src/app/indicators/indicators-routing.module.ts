import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IndicatorsComponent } from './indicators.component';

const routes: Routes = [
  { path: 'indicators', component: IndicatorsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndicatorsRoutingModule { }
