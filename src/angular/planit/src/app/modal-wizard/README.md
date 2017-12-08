## ModalWizardModule

Any module that uses this one should ensure that this module is imported using the `withComponents()` method, adding any component you intend to open via the ModalWizardComponent to the array passed to `withComponents()`.

For example:
```
@NgModule({
  imports: [
    CommonModule,
    ModalWizardModule.withComponents([MyModalComponent]),
  ],
  declarations: [
    MyModalComponent
  ]
})
export class MyAppModule { }
```

See [../assessment/assessment.module.ts](../assessment/assessment.module.ts) for an example.
