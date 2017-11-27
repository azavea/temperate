import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ChartsModule } from 'climate-change-components';

import { SidebarComponent } from './sidebar/sidebar.component';
import { TopConcernsComponent } from './top-concerns/top-concerns.component';
import { HelpModalComponent } from './help-modal/help-modal.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ChartComponent } from './chart/chart.component';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { NouisliderModule } from 'ng2-nouislider';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BsDropdownModule.forRoot(),
    ChartsModule,
    NouisliderModule
  ],
  declarations: [
    SidebarComponent,
    TopConcernsComponent,
    HelpModalComponent,
    UserDropdownComponent,
    NavbarComponent,
    ChartComponent
  ],
  exports: [
    HelpModalComponent,
    UserDropdownComponent,
    CommonModule,
    RouterModule,
    SidebarComponent,
    TopConcernsComponent,
    NavbarComponent,
    ChartComponent
  ]
})
export class SharedModule { }
