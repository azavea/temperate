import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { environment } from '../environments/environment';

import { MarketingComponent } from './marketing/marketing.component';
import { PageNotFoundComponent } from './not-found.component';

const routes: Routes = [
  { path: '', component: MarketingComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: !environment.production })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
