import { FormGroup } from '@angular/forms';

import { Risk } from '../../shared/';
import { RiskHandler } from '../risk-wizard-session.service';

// TODO: Make class and have class handle risk handler registration
export interface RiskStepComponent {
  form: FormGroup;
  key: string;
  navigationSymbol: string;
  title: string;

  fromRisk(risk: Risk): any;
  registerRiskHandlers(): void;
  setupForm(data: any): void;
  toRisk(data: any, risk: Risk): Risk;
}
