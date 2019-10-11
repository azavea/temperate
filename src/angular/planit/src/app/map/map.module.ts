import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AgmCoreModule } from '@agm/core';
import { AngularOpenlayersModule  } from 'ngx-openlayers';

import { SharedModule } from '../shared/shared.module';
import { MapRoutingModule } from './map-routing.module';

import { MapComponent } from './map.component';

@NgModule({
  imports: [
    AgmCoreModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    AngularOpenlayersModule,
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
