import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Risk } from '../../shared/';
import { RiskStepKey } from '../risk-step-key';
import { RiskHandler, RiskWizardSessionService } from '../risk-wizard-session.service';

@Component({})
export abstract class RiskStepComponent implements OnInit {
  abstract form: FormGroup;
  abstract key: RiskStepKey;
  abstract navigationSymbol: string;
  abstract title: string;

  // Subclass constructors must also inject RiskWizardSessionService and call:
  //  super(session);
  constructor(protected session: RiskWizardSessionService) {}

  // Subclass ngOnInit methods must implement ngOnInit and call `super.ngOnInit()` first in
  //  their implementations
  ngOnInit() {
    this.registerRiskHandlers();
  }

  abstract fromRisk(risk: Risk): any;
  abstract setupForm(data: any): void;
  abstract toRisk(data: any, risk: Risk): Risk;

  registerRiskHandlers() {
    this.session.registerHandlerForKey(this.key, {
      fromRisk: this.fromRisk,
      toRisk: this.toRisk
    });
  }
}
