
import { NgModule } from '@angular/core';

import { ModalWizardComponent } from './modal-wizard.component';
import { ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core/src/metadata/di';


@NgModule({
  imports: [],
  exports: [ModalWizardComponent],
  declarations: [ModalWizardComponent],
  providers: [],
})
export class ModalWizardModule {
  // static withComponents(components: any[]) {
  //   return {
  //     ngModule: ModalWizardModule,
  //     providers: [
  //       { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
  //     ]
  //   }
  // }
}
