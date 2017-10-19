import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SidebarComponent } from './sidebar/sidebar.component';
import { TopConcernsComponent } from './top-concerns/top-concerns.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    SidebarComponent,
    TopConcernsComponent
  ],
  exports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    TopConcernsComponent
  ]
})
export class SharedModule { }
