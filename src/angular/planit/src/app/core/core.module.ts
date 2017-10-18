import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpModalComponent } from './help-modal/help-modal.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
  ],
  declarations: [
    HelpModalComponent,
    UserDropdownComponent,
    NavbarComponent
  ],
  exports: [
    HelpModalComponent,
    UserDropdownComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CoreModule { }
