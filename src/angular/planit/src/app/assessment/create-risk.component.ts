import { Component, OnInit, ViewChild } from '@angular/core';

import { RiskWizardComponent } from '../risk-wizard/';

@Component({
  selector: 'va-create-risk',
  templateUrl: '../shared/wizard/create-model.component.html'
})
export class CreateRiskComponent implements OnInit {

  public wizardComponent = RiskWizardComponent;

  constructor() { }

  ngOnInit() {}
}
