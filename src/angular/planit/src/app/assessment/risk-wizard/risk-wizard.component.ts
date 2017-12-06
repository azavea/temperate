import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

// Import from root doesn't seem to pickup types, so import directly from file
import { WizardComponent } from 'ng2-archwizard/dist/components/wizard.component';

import { CapacityStepComponent } from './steps/capacity-step.component';
import { HazardStepComponent } from './steps/hazard-step.component';
import { IdentifyStepComponent } from './steps/identify-step.component';
import { ImpactStepComponent } from './steps/impact-step.component';
import { ReviewStepComponent } from './steps/review-step.component';

@Component({
  selector: 'va-risk-wizard',
  templateUrl: 'risk-wizard.component.html'
})
export class RiskWizardComponent implements AfterViewInit, OnInit {

  @ViewChild(WizardComponent) public wizard: WizardComponent;
  @ViewChild(IdentifyStepComponent) public identifyStep: IdentifyStepComponent;
  @ViewChild(HazardStepComponent) public hazardStep: HazardStepComponent;
  @ViewChild(ImpactStepComponent) public impactStep: ImpactStepComponent;
  @ViewChild(CapacityStepComponent) public capacityStep: CapacityStepComponent;
  @ViewChild(ReviewStepComponent) public reviewStep: ReviewStepComponent;

  constructor() {}

  ngOnInit() {}

  // this.wizard.navigation and this.wizard.model are not available until this hook
  ngAfterViewInit() {}
}
