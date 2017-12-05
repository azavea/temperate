import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { WizardComponent } from 'ng2-archwizard';
import { CapacityStepComponent } from './steps/capacity-step.component';
import { HazardStepComponent } from './steps/hazard-step.component';
import { IdentifyStepComponent } from './steps/identify-step.component';
import { ImpactStepComponent } from './steps/impact-step.component';
import { ReviewStepComponent } from './steps/review-step.component';

@Component({
  selector: 'va-new-risk-wizard',
  templateUrl: 'new-risk-wizard.component.html'
})
export class NewRiskWizardComponent implements OnInit {

  @ViewChild("wizard") wizard: WizardComponent;
  @ViewChild("identifyStep") identifyStep: IdentifyStepComponent;
  @ViewChild("hazardStep") hazardStep: HazardStepComponent;
  @ViewChild("impactStep") impactStep: ImpactStepComponent;
  @ViewChild("capacityStep") capacityStep: CapacityStepComponent;
  @ViewChild("reviewStep") reviewStep: ReviewStepComponent;

  constructor(private router: Router) { }

  ngOnInit() { }
}
