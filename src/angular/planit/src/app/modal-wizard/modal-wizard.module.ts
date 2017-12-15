
import { NgModule, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';

import { ModalWizardComponent } from './modal-wizard.component';

@NgModule({
  imports: [],
  exports: [ModalWizardComponent],
  declarations: [ModalWizardComponent],
  providers: [],
})
export class ModalWizardModule {
  static withComponents(components: any[]) {
    return {
      ngModule: ModalWizardModule,
      providers: [
        { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
      ]
    };
  }
}
