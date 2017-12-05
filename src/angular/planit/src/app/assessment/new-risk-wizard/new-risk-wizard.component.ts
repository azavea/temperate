import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { WizardComponent } from 'ng2-archwizard';
import { IdentifyStepComponent } from './steps/identify-step.component';
import { HazardStepComponent } from './steps/hazard-step.component';

@Component({
  selector: 'va-new-risk-wizard',
  templateUrl: 'new-risk-wizard.component.html'
})
export class NewRiskWizardComponent implements OnInit {

  @ViewChild("wizard") wizard: WizardComponent;
  @ViewChild("identifyStep") identifyStep: IdentifyStepComponent;
  @ViewChild("hazardStep") hazardStep: HazardStepComponent;

  constructor(private router: Router) { }

  ngOnInit() { }

  onWizardFinish() {
    this.router.navigate(['assessment']);
  }
}
