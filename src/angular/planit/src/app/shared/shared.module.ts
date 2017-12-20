import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BsDropdownModule } from 'ngx-bootstrap';
import { ChartsModule } from 'climate-change-components';
import { NouisliderModule } from 'ng2-nouislider';

import { ChartComponent } from './chart/chart.component';
import { HelpModalComponent } from './help-modal/help-modal.component';
import { NavbarComponent } from './navbar/navbar.component';
import { OptionDropdownComponent } from './option-dropdown/option-dropdown.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopConcernsComponent } from './top-concerns/top-concerns.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BsDropdownModule,
    ChartsModule,
    NouisliderModule
  ],
  declarations: [
    ChartComponent,
    HelpModalComponent,
    NavbarComponent,
    OptionDropdownComponent,
    SidebarComponent,
    TopConcernsComponent,
    UserDropdownComponent
  ],
  exports: [
    ChartComponent,
    HelpModalComponent,
    NavbarComponent,
    OptionDropdownComponent,
    SidebarComponent,
    TopConcernsComponent,
    UserDropdownComponent
  ]
})
export class SharedModule { }
