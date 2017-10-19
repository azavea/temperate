import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SidebarComponent } from './sidebar/sidebar.component';
import { TopConcernsComponent } from './top-concerns/top-concerns.component';
import { HelpModalComponent } from './help-modal/help-modal.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';
import { NavbarComponent } from './navbar/navbar.component';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BsDropdownModule.forRoot()
  ],
  declarations: [
    SidebarComponent,
    TopConcernsComponent
    HelpModalComponent,
    UserDropdownComponent,
    NavbarComponent
  ],
  exports: [
    HelpModalComponent,
    UserDropdownComponent,
    CommonModule,
    RouterModule,
    SidebarComponent,
    TopConcernsComponent
    NavbarComponent
  ]
})
export class SharedModule { }
