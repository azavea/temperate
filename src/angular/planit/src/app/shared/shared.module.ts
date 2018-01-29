import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ChartsModule } from 'climate-change-components';
import { NouisliderModule } from 'ng2-nouislider';
import { BsDropdownModule, TypeaheadModule } from 'ngx-bootstrap';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { AdaptiveNeedBoxComponent } from './adaptive-need-box/adaptive-need-box.component';
import { ChartComponent } from './chart/chart.component';
import {
  CircularProgressbarDirective
} from './circular-progressbar/circular-progressbar.directive';
import { CollapsibleChartComponent } from './collapsible-chart/collapsible-chart.component';
import { FooterComponent } from './footer/footer.component';
import {
  ForceCollapseChartContainerComponent,
} from './force-collapse-chart-container/force-collapse-chart-container.component';
import {
  FreeformMultiselectComponent
} from './freeform-multiselect/freeform-multiselect.component';
import { HelpModalComponent } from './help-modal/help-modal.component';
import { IndicatorChartComponent } from './indicator-chart/indicator-chart.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ModalTemplateComponent } from './modal-template/modal-template.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NewUserFormComponent } from './new-user-form/new-user-form.component';
import { OptionDropdownComponent } from './option-dropdown/option-dropdown.component';
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
    PopoverModule,
    RouterModule,
    TypeaheadModule,
  ],
  declarations: [
    AdaptiveNeedBoxComponent,
    ChartComponent,
    CircularProgressbarDirective,
    CollapsibleChartComponent,
    FooterComponent,
    ForceCollapseChartContainerComponent,
    FreeformMultiselectComponent,
    HelpModalComponent,
    IndicatorChartComponent,
    LoginFormComponent,
    ModalTemplateComponent,
    NavbarComponent,
    NewUserFormComponent,
    OptionDropdownComponent,
    TopConcernsComponent,
    UserDropdownComponent
  ],
  exports: [
    AdaptiveNeedBoxComponent,
    ChartComponent,
    CircularProgressbarDirective,
    CollapsibleChartComponent,
    FooterComponent,
    ForceCollapseChartContainerComponent,
    FreeformMultiselectComponent,
    HelpModalComponent,
    IndicatorChartComponent,
    LoginFormComponent,
    ModalTemplateComponent,
    NavbarComponent,
    NewUserFormComponent,
    OptionDropdownComponent,
    TopConcernsComponent,
    UserDropdownComponent
  ]
})
export class SharedModule { }
