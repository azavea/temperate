import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BsDropdownModule, TypeaheadModule } from 'ngx-bootstrap';
import { ChartsModule } from 'climate-change-components';
import { NouisliderModule } from 'ng2-nouislider';

import { ChartComponent } from './chart/chart.component';
import { HelpModalComponent } from './help-modal/help-modal.component';
import { NavbarComponent } from './navbar/navbar.component';
import {
  FreeformMultiselectComponent
} from './freeform-multiselect/freeform-multiselect.component';
import { OptionDropdownComponent } from './option-dropdown/option-dropdown.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopConcernsComponent } from './top-concerns/top-concerns.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';


@NgModule({
  imports: [
    BsDropdownModule,
    CommonModule,
    ChartsModule,
    FormsModule,
    NouisliderModule,
    RouterModule,
    TypeaheadModule,
  ],
  declarations: [
    ChartComponent,
    HelpModalComponent,
    NavbarComponent,
    OptionDropdownComponent,
    FreeformMultiselectComponent,
    SidebarComponent,
    TopConcernsComponent,
    UserDropdownComponent
  ],
  exports: [
    ChartComponent,
    HelpModalComponent,
    NavbarComponent,
    OptionDropdownComponent,
    FreeformMultiselectComponent,
    SidebarComponent,
    TopConcernsComponent,
    UserDropdownComponent
  ]
})
export class SharedModule { }
