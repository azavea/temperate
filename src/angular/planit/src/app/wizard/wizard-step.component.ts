/*
 * A generic set of properties/methods that each step in a wizard should implement
 *
 * Depends on the WizardSessionService, concrete subclasses should determine its type.
 */
import { OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { WizardSessionService } from './wizard-session.service';

export abstract class WizardStepComponent<T> implements OnInit {
  abstract form: FormGroup;
  abstract key: string;
  abstract navigationSymbol: string;
  abstract title: string;

  // Subclass constructors must also inject WizardSessionService and call:
  //  super(session);
  constructor(protected session: WizardSessionService<T>) {}

  // Subclass ngOnInit methods must implement ngOnInit and call `super.ngOnInit()` first in
  //  their implementations
  ngOnInit() {
    this.registerModelHandlers();
  }

  abstract fromModel(model: T): any;
  abstract setupForm(data: any): void;
  abstract toModel(data: any, model: T): T;

  registerModelHandlers() {
    this.session.registerHandlerForKey(this.key, {
      fromData: this.fromModel,
      toData: this.toModel
    });
  }
}
