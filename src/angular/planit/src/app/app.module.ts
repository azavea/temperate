import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { IndexComponent } from './index.component';
import { PageNotFoundComponent } from './not-found.component';
import { environment } from '../environments/environment';


const appRoutes: Routes = [
  { path: 'index', component: IndexComponent },
  { path: '', redirectTo: '/index', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: !environment.production } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
