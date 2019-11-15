import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AgmCoreModule } from '@agm/core';
import { NouisliderModule } from 'ng2-nouislider';
import { BsDropdownModule, ModalModule, TooltipModule, TypeaheadModule } from 'ngx-bootstrap';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { AngularOpenlayersModule  } from 'ngx-openlayers';
import { ChartsModule } from '../climate-api/charts/charts.module';

import { AdaptiveNeedBoxComponent } from './adaptive-need-box/adaptive-need-box.component';
import {
  AddCommunitySystemsComponent
} from './add-community-systems/add-community-systems.component';
import { AddWeatherEventsComponent } from './add-weather-events/add-weather-events.component';
import { ChartComponent } from './chart/chart.component';
import { CollapsibleChartComponent } from './collapsible-chart/collapsible-chart.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { FooterComponent } from './footer/footer.component';
import {
  ForceCollapseChartContainerComponent,
} from './force-collapse-chart-container/force-collapse-chart-container.component';
import {
  FreeformMultiselectComponent
} from './freeform-multiselect/freeform-multiselect.component';
import { GmapAutocompleteDirective } from './gmap-autocomplete/gmap-autocomplete.directive';
import { GmapStaticMapComponent } from './gmap-static-map/gmap-static-map.component';
import { HelpModalComponent } from './help-modal/help-modal.component';
import { ImpactMapModalComponent } from './impact-map/impact-map-modal.component';
import { ImpactMapComponent } from './impact-map/impact-map.component';
import { IndicatorChartComponent } from './indicator-chart/indicator-chart.component';
import { LDProgressbarDirective } from './ldProgressbar/ld-progressbar.directive';
import { LoginFormComponent } from './login-form/login-form.component';
import { ModalTemplateComponent } from './modal-template/modal-template.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NewUserFormComponent } from './new-user-form/new-user-form.component';
import { OptionDropdownComponent } from './option-dropdown/option-dropdown.component';
import { OrgDropdownComponent } from './org-dropdown/org-dropdown.component';
import {
  OrgLocationGeocoderComponent
} from './org-location-geocoder/org-location-geocoder.component';
import { PasswordResetFormComponent } from './password-reset-form/password-reset-form.component';
import {
  PasswordValidatorPopoverComponent
} from './password-validator-popover/password-validator-popover.component';
import { PasswordValidatorDirective } from './password-validator/password-validator.directive';
import { SubmitPlanButtonComponent } from './submit-plan-button/submit-plan-button.component';
import {
  TopCommunitySystemsComponent
} from './top-community-systems/top-community-systems.component';
import { TopConcernsComponent } from './top-concerns/top-concerns.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';
import { UserEmailsComponent } from './user-emails/user-emails.component';


@NgModule({
  imports: [
    AgmCoreModule,
    AngularOpenlayersModule,
    CollapseModule,
    CommonModule,
    RouterModule,
    BsDropdownModule,
    CommonModule,
    ChartsModule,
    FormsModule,
    ModalModule,
    NouisliderModule,
    PopoverModule,
    TooltipModule,
    TypeaheadModule,
  ],
  declarations: [
    AdaptiveNeedBoxComponent,
    AddCommunitySystemsComponent,
    AddWeatherEventsComponent,
    ChartComponent,
    CollapsibleChartComponent,
    ConfirmationModalComponent,
    FooterComponent,
    ForceCollapseChartContainerComponent,
    FreeformMultiselectComponent,
    GmapAutocompleteDirective,
    GmapStaticMapComponent,
    ImpactMapComponent,
    ImpactMapModalComponent,
    HelpModalComponent,
    IndicatorChartComponent,
    LDProgressbarDirective,
    LoginFormComponent,
    ModalTemplateComponent,
    NavbarComponent,
    NewUserFormComponent,
    OptionDropdownComponent,
    OrgDropdownComponent,
    OrgLocationGeocoderComponent,
    PasswordResetFormComponent,
    PasswordValidatorDirective,
    PasswordValidatorPopoverComponent,
    SubmitPlanButtonComponent,
    TopCommunitySystemsComponent,
    TopConcernsComponent,
    UserDropdownComponent,
    UserEmailsComponent
  ],
  exports: [
    AdaptiveNeedBoxComponent,
    AddCommunitySystemsComponent,
    AddWeatherEventsComponent,
    ChartComponent,
    CollapsibleChartComponent,
    ConfirmationModalComponent,
    FooterComponent,
    ForceCollapseChartContainerComponent,
    FreeformMultiselectComponent,
    GmapAutocompleteDirective,
    GmapStaticMapComponent,
    HelpModalComponent,
    ImpactMapComponent,
    ImpactMapModalComponent,
    IndicatorChartComponent,
    LDProgressbarDirective,
    LoginFormComponent,
    ModalTemplateComponent,
    NavbarComponent,
    NewUserFormComponent,
    OptionDropdownComponent,
    OrgDropdownComponent,
    OrgLocationGeocoderComponent,
    PasswordResetFormComponent,
    PasswordValidatorDirective,
    PasswordValidatorPopoverComponent,
    SubmitPlanButtonComponent,
    TopCommunitySystemsComponent,
    TopConcernsComponent,
    UserDropdownComponent,
    UserEmailsComponent
  ]
})
export class SharedModule { }
