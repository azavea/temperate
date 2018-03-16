import { Location } from '@angular/common';
import { AfterViewChecked,
         ChangeDetectorRef,
         Component,
         Input,
         OnInit,
         ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

// Import from root doesn't seem to pickup types, so import directly from file
import { WizardComponent } from 'ng2-archwizard/dist/components/wizard.component';

import { RiskService } from '../core/services/risk.service';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Risk } from '../shared/';
import { CapacityStepComponent } from './steps/capacity-step/capacity-step.component';
import { HazardStepComponent } from './steps/hazard-step/hazard-step.component';
import { IdentifyStepComponent } from './steps/identify-step/identify-step.component';
import { ImpactStepComponent } from './steps/impact-step/impact-step.component';
import { ReviewStepComponent } from './steps/review-step/review-step.component';

@Component({
  selector: 'app-risk-wizard',
  templateUrl: 'risk-wizard.component.html',
  providers: [WizardSessionService]
})
export class RiskWizardComponent implements OnInit, AfterViewChecked {
  // this.wizard.navigation and this.wizard.model are not available until after AfterViewInit

  @ViewChild(WizardComponent) public wizard: WizardComponent;
  @ViewChild(IdentifyStepComponent) public identifyStep: IdentifyStepComponent;
  @ViewChild(HazardStepComponent) public hazardStep: HazardStepComponent;
  @ViewChild(ImpactStepComponent) public impactStep: ImpactStepComponent;
  @ViewChild(CapacityStepComponent) public capacityStep: CapacityStepComponent;
  @ViewChild(ReviewStepComponent) public reviewStep: ReviewStepComponent;

  @Input() risk: Risk;

  public startingStep = 0;

  constructor(private session: WizardSessionService<Risk>,
    private changeDetector: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private location: Location) {}

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    if (!this.risk) {
      this.risk = new Risk({
        community_system: { name: '' },
        weather_event: { name: '' }
      });
    }
    this.session.setData(this.risk);

    // Update the URL with the risk id once the risk is saved
    this.session.data
      .first(risk => risk.id !== undefined)
      .subscribe((risk) => {
        this.location.replaceState(`/assessment/risk/${risk.id}`);
      });


    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.startingStep = params['goToStep'] || 0;
    });
  }

  public resetScroll() {
    window.scrollTo(0, 0);
  }
}
