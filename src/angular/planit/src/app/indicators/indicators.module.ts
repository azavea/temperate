import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ChartsModule } from 'climate-change-components';

import { SharedModule } from '../shared/shared.module';
import { IndicatorsRoutingModule } from './indicators-routing.module';

import { IndicatorsComponent } from './indicators.component';
import { IndicatorChartComponent } from './indicator-chart/indicator-chart.component';
import { WeatherEventIconPipe } from './weather-event-icon.pipe';

@NgModule({
  imports: [
    CollapseModule.forRoot(),
    CommonModule,
    ChartsModule,
    SharedModule,
    IndicatorsRoutingModule
  ],
  declarations: [
    IndicatorsComponent,
    IndicatorChartComponent,
    WeatherEventIconPipe
  ],
  exports: [
    IndicatorsComponent,
    IndicatorChartComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class IndicatorsModule { }
