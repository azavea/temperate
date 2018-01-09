import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BsDropdownModule, TypeaheadModule } from 'ngx-bootstrap';
import { ChartsModule } from 'climate-change-components';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { NouisliderModule } from 'ng2-nouislider';

import { ChartComponent } from './chart/chart.component';
import { CollapsibleChartComponent } from './collapsible-chart/collapsible-chart.component';
import { HelpModalComponent } from './help-modal/help-modal.component';
import { IndicatorChartComponent } from './indicator-chart/indicator-chart.component';
import { ModalTemplateComponent } from './modal-template/modal-template.component';
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
    CollapseModule,
    CommonModule,
    RouterModule,
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
    CollapsibleChartComponent,
    HelpModalComponent,
    IndicatorChartComponent,
    ModalTemplateComponent,
    NavbarComponent,
    OptionDropdownComponent,
    FreeformMultiselectComponent,
    SidebarComponent,
    TopConcernsComponent,
    UserDropdownComponent
  ],
  exports: [
    ChartComponent,
    CollapsibleChartComponent,
    HelpModalComponent,
    IndicatorChartComponent,
    ModalTemplateComponent,
    NavbarComponent,
    OptionDropdownComponent,
    FreeformMultiselectComponent,
    SidebarComponent,
    TopConcernsComponent,
    UserDropdownComponent
  ]
})
export class SharedModule { }
