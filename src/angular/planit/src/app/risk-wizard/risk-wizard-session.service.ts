import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Rx';

import { RiskStepKey } from './risk-step-key';
import { Risk } from '../shared/';
import { RiskStepComponent } from './steps/risk-step.component';

export interface RiskHandler {
  toRisk: (any, Risk) => Risk;
  fromRisk: (Risk) => any;
}

@Injectable()
export class RiskWizardSessionService {

  private _risk: Risk = new Risk({});
  private handlers: Map<string, RiskHandler> = new Map<string, RiskHandler>();
  public risk: Subject<Risk> = new Subject<Risk>();

  getRisk() {
    return this._risk;
  }

  registerHandlerForKey(key: RiskStepKey, handlers: RiskHandler) {
    this.handlers.set(key, handlers);
  }

  setDataForKey(key: RiskStepKey, data: any, notify: boolean = true) {
    const handler = this.handlers.get(key);
    this._risk = handler.toRisk(data, this._risk);
    if (notify) {
        this.risk.next(this._risk);
    }
  }

  setRisk(risk: Risk, notify: boolean = true) {
    this._risk = risk;
    if (notify) {
      this.risk.next(this._risk);
    }
  }
}
