## ModalWizardModule

**Note:** In order to properly support AOT, any module that uses this one should ensure that the component passed to `<app-modal-wizard [component]="yourComponent"></app-modal-wizard>` needs to be defined in the NgModule.entryComponents property of the module exporting `yourComponent`.

See ../assessment/assessment.module.ts for an example.
