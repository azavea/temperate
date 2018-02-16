import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EditableInputComponent } from './editable-input/editable-input.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule
  ],
  declarations: [
    EditableInputComponent,
    SettingsComponent,
  ]
})
export class SettingsModule { }
