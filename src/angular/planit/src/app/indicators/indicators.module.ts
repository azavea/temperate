import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { IndicatorsRoutingModule } from './indicators-routing.module';

import { IndicatorsComponent } from './indicators.component';
import { WeatherEventIconPipe } from './weather-event-icon.pipe';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    IndicatorsRoutingModule
  ],
  declarations: [
    IndicatorsComponent,
    WeatherEventIconPipe
  ],
  exports: [
    IndicatorsComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class IndicatorsModule { }
