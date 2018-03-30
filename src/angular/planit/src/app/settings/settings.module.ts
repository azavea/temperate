import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap';

import { SharedModule } from '../shared/shared.module';

import { EditableInputComponent } from './editable-input/editable-input.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BsDatepickerModule,
    SharedModule,
    SettingsRoutingModule
  ],
  declarations: [
    EditableInputComponent,
    SettingsComponent,
  ]
})
export class SettingsModule { }
