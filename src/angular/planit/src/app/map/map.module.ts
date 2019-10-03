import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AgmCoreModule } from '@agm/core';

import { SharedModule } from '../shared/shared.module';
import { MapRoutingModule } from './map-routing.module';

import { MapComponent } from './map.component';

@NgModule({
  imports: [
    AgmCoreModule,
    CommonModule,
    FormsModule,
    SharedModule,
    MapRoutingModule
  ],
  declarations: [
    MapComponent
  ],
  exports: [
    MapComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MapModule { }
