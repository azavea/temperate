import { Component, OnInit, ViewChild } from '@angular/core';

import { RiskWizardComponent } from './risk-wizard/risk-wizard.component';

@Component({
  selector: 'va-create-risk',
  templateUrl: 'create-risk.component.html'
})
export class CreateRiskComponent implements OnInit {

  public wizardComponent = RiskWizardComponent;

  constructor() { }

  ngOnInit() {}
}
