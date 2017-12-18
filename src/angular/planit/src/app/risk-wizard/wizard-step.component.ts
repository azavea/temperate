/*
 * A generic set of properties/methods that each step in a wizard should implement
 *
 * Depends on the WizardSessionService, concrete subclasses should determine its type.
 *
 * This class, along with the WizardSessionService, should be moved out of the risk-wizard
 * module when we begin implementing multiple wizards.
 */
import { OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Risk } from './../shared/';
import { RiskStepKey } from './risk-step-key';
import { WizardSessionService } from './wizard-session.service';

export abstract class WizardStepComponent<T> implements OnInit {
  abstract form: FormGroup;
  abstract key: string;
  abstract navigationSymbol: string;
  abstract title: string;

  // Subclass constructors must also inject RiskWizardSessionService and call:
  //  super(session);
  constructor(protected session: WizardSessionService<T>) {}

  // Subclass ngOnInit methods must implement ngOnInit and call `super.ngOnInit()` first in
  //  their implementations
  ngOnInit() {
    this.registerRiskHandlers();
  }

  abstract fromData(data: T): any;
  abstract setupForm(data: any): void;
  abstract toData(data: any, risk: T): T;

  registerRiskHandlers() {
    this.session.registerHandlerForKey(this.key, {
      fromData: this.fromData,
      toData: this.toData
    });
  }
}
