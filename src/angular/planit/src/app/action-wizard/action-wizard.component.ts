import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';

// Import from root doesn't seem to pickup types, so import directly from file
import { WizardComponent } from 'ng2-archwizard/dist/components/wizard.component';

import { Action, Risk } from '../shared';
import { AssessStepComponent } from './steps/assess-step/assess-step.component';
import { ActionService } from '../core/services/action.service';
import { CategoryStepComponent } from './steps/category-step/category-step.component';
import { CommunitySystemService } from '../core/services/community-system.service';
import { FundingStepComponent } from './steps/funding-step/funding-step.component';
import {
  ImplementationStepComponent
} from './steps/implementation-step/implementation-step.component';
import { ImprovementsStepComponent } from './steps/improvements-step/improvements-step.component';
import { ReviewStepComponent } from './steps/review-step/review-step.component';
import { RiskService } from '../core/services/risk.service';
import { WeatherEventService } from '../core/services/weather-event.service';
import { WizardSessionService } from '../core/services/wizard-session.service';

@Component({
  selector: 'app-action-wizard',
  templateUrl: './action-wizard.component.html',
  providers: [WizardSessionService]
})
export class ActionWizardComponent implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild(WizardComponent) public wizard: WizardComponent;
  @ViewChild(AssessStepComponent) public assessStep: AssessStepComponent;
  @ViewChild(ImplementationStepComponent) public implementationStep: ImplementationStepComponent;
  @ViewChild(ImprovementsStepComponent) public improvementsStep: ImprovementsStepComponent;
  @ViewChild(CategoryStepComponent) public categoryStep: CategoryStepComponent;
  @ViewChild(FundingStepComponent) public fundingStep: FundingStepComponent;
  @ViewChild(ReviewStepComponent) public reviewStep: ReviewStepComponent;

  private action: Action;

  constructor(private session: WizardSessionService<Action>,
              private actionService: ActionService,
              private riskService: RiskService,
              private communitySystemService: CommunitySystemService,
              private weatherEventService: WeatherEventService) { }

  ngOnInit() {
    if (!this.action) {
      this.action = new Action({});

      // Actions require Risks, so pick one arbitrarily
      // TODO (#426) - Get rid of this and use the existing Risk the user clicked on instead
      this.riskService.list().subscribe(risks => {
        const risk = risks[0];

        this.action.risk = risk.id;

        if (risk.action) {
          // Re-use the action's ID if the Risk already had one
          this.action.id = risk.action;
        }
      });
    }

    this.session.setData(this.action);
    this.session.data.subscribe(a => this.actionModelChanged(a));
  }

  ngOnDestroy() {
    this.session.data.unsubscribe();
  }

  // this.wizard.navigation and this.wizard.model are not available until this hook
  ngAfterViewInit() {}

  actionModelChanged(action: Action) {
    if (!this.action.id) {
      this.actionService.create(this.action).subscribe(a => {
        this.action = a;
        this.session.setData(a);
      });
    } else {
      this.actionService.update(action).subscribe(a => this.action = a);
    }
  }

}
