import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

// Import from root doesn't seem to pickup types, so import directly from file
import { WizardComponent } from 'ng2-archwizard/dist/components/wizard.component';

import { CapacityStepComponent } from './steps/capacity-step/capacity-step.component';
import { HazardStepComponent } from './steps/hazard-step/hazard-step.component';
import { IdentifyStepComponent } from './steps/identify-step/identify-step.component';
import { ImpactStepComponent } from './steps/impact-step/impact-step.component';
import { ReviewStepComponent } from './steps/review-step/review-step.component';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Risk } from '../shared/';
import { RiskService } from '../core/services/risk.service';

@Component({
  selector: 'app-risk-wizard',
  templateUrl: 'risk-wizard.component.html',
  providers: [WizardSessionService]
})
export class RiskWizardComponent implements OnDestroy, OnInit {
  // this.wizard.navigation and this.wizard.model are not available until after AfterViewInit

  @ViewChild(WizardComponent) public wizard: WizardComponent;
  @ViewChild(IdentifyStepComponent) public identifyStep: IdentifyStepComponent;
  @ViewChild(HazardStepComponent) public hazardStep: HazardStepComponent;
  @ViewChild(ImpactStepComponent) public impactStep: ImpactStepComponent;
  @ViewChild(CapacityStepComponent) public capacityStep: CapacityStepComponent;
  @ViewChild(ReviewStepComponent) public reviewStep: ReviewStepComponent;

  private risk: Risk;
  private alreadyCreatedRisk = false;

  constructor(private session: WizardSessionService<Risk>,
              private riskService: RiskService) {}

  ngOnInit() {
    // TODO (#324): Set initial risk from API
    this.risk = new Risk({
      communitySystem: { name: '' },
      weatherEvent: { name: '' }
    });
    this.session.setData(this.risk);
    this.session.data.subscribe(r => this.riskModelChanged(r));
  }

  ngOnDestroy() {
    this.session.data.unsubscribe();
  }

  riskModelChanged(risk: Risk) {
    if (!this.risk.id) {
      this.riskService.create(this.risk).subscribe(r => {
        this.risk = r;
        this.alreadyCreatedRisk = true;
        this.session.setData(r);
      });
    } else if (this.alreadyCreatedRisk) {
      this.riskService.update(risk).subscribe(r => {
        this.risk = r;
      });
    }
  }
}
