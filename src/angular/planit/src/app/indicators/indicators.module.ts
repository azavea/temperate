import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollapseModule } from 'ngx-bootstrap/collapse';

import { SharedModule } from '../shared/shared.module';
import { IndicatorsRoutingModule } from './indicators-routing.module';

import { IndicatorsComponent } from './indicators.component';

@NgModule({
  imports: [
    CollapseModule.forRoot(),
    CommonModule,
    SharedModule,
    IndicatorsRoutingModule
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
