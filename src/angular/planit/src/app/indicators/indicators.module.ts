import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollapseModule } from 'ngx-bootstrap/collapse';

import { SharedModule } from '../shared/shared.module';
import { IndicatorsComponent } from './indicators.component';
import { IndicatorChartComponent } from './indicator-chart.component';

@NgModule({
  imports: [
    CollapseModule.forRoot(),
    CommonModule,
    SharedModule
  ],
  declarations: [
    IndicatorsComponent,
    IndicatorChartComponent
  ],
  exports: [
    IndicatorsComponent,
    IndicatorChartComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class IndicatorsModule { }
