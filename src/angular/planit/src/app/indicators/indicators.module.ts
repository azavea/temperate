import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { IndicatorsComponent } from './indicators.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    IndicatorsComponent
  ],
  exports: [
    IndicatorsComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class IndicatorsModule { }
