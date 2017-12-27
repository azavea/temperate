import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

// Import from root doesn't seem to pickup types, so import directly from file
import { WizardComponent } from 'ng2-archwizard/dist/components/wizard.component';

import { CapacityStepComponent } from './steps/capacity-step.component';
import { HazardStepComponent } from './steps/hazard-step.component';
import { IdentifyStepComponent } from './steps/identify-step.component';
import { ImpactStepComponent } from './steps/impact-step.component';
import { ReviewStepComponent } from './steps/review-step.component';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Risk } from '../shared/';

@Component({
  selector: 'app-risk-wizard',
  templateUrl: 'risk-wizard.component.html',
  providers: [WizardSessionService]
})
export class RiskWizardComponent implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild(WizardComponent) public wizard: WizardComponent;
  @ViewChild(IdentifyStepComponent) public identifyStep: IdentifyStepComponent;
  @ViewChild(HazardStepComponent) public hazardStep: HazardStepComponent;
  @ViewChild(ImpactStepComponent) public impactStep: ImpactStepComponent;
  @ViewChild(CapacityStepComponent) public capacityStep: CapacityStepComponent;
  @ViewChild(ReviewStepComponent) public reviewStep: ReviewStepComponent;

  constructor(private session: WizardSessionService<Risk>) {}

  ngOnInit() {
    // TODO (#324): Set initial risk from API
    const risk = new Risk({
      communitySystem: { name: '' },
      weatherEvent: { name: '' }
    });
    this.session.setData(risk);
    this.session.data.subscribe(r => this.riskModelChanged(r));
  }

  ngOnDestroy() {
    this.session.data.unsubscribe();
  }

  // this.wizard.navigation and this.wizard.model are not available until this hook
  ngAfterViewInit() {}

  riskModelChanged(risk: Risk) {
    console.log(risk);
  }
}
