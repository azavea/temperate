import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MapRoutingModule } from './map-routing.module';

import { SharedModule } from '../shared/shared.module';
import { MapPageComponent } from './map.component';

@NgModule({
  imports: [
    SharedModule,
    MapRoutingModule
  ],
  declarations: [
    MapPageComponent
  ],
  exports: [
    MapPageComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MapModule { }
