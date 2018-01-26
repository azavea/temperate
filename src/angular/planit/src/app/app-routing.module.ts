import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { environment } from '../environments/environment';

import { MarketingAuthGuard } from './core/services/marketing-auth-guard.service';
import { MarketingComponent } from './marketing/marketing.component';
import { PageNotFoundComponent } from './not-found.component';

const routes: Routes = [
  { path: '', component: MarketingComponent, canActivate: [MarketingAuthGuard] },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: !environment.production })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
