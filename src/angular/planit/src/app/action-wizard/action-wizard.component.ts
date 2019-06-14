import { Location } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';

// Import from root doesn't seem to pickup types, so import directly from file
import { WizardComponent } from 'ng2-archwizard/dist/components/wizard.component';

import { ActionService } from '../core/services/action.service';
import { CommunitySystemService } from '../core/services/community-system.service';
import { RiskService } from '../core/services/risk.service';
import { WeatherEventService } from '../core/services/weather-event.service';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Action, Risk } from '../shared';
import { AssessStepComponent } from './steps/assess-step/assess-step.component';
import { CategoryStepComponent } from './steps/category-step/category-step.component';
import { FundingStepComponent } from './steps/funding-step/funding-step.component';
import {
  ImplementationStepComponent
} from './steps/implementation-step/implementation-step.component';
import { ImprovementsStepComponent } from './steps/improvements-step/improvements-step.component';
import { ReviewStepComponent } from './steps/review-step/review-step.component';


interface NamedRisk {
  name: string;
  risk: Risk;
}

@Component({
  selector: 'app-action-wizard',
  templateUrl: './action-wizard.component.html',
  providers: [WizardSessionService]
})
export class ActionWizardComponent implements AfterViewInit, OnInit {

  @ViewChild(WizardComponent, {static: true}) public wizard: WizardComponent;
  @ViewChild(AssessStepComponent, {static: true}) public assessStep: AssessStepComponent;
  @ViewChild(ImplementationStepComponent, {static: true}) public implementationStep: ImplementationStepComponent;
  @ViewChild(ImprovementsStepComponent, {static: true}) public improvementsStep: ImprovementsStepComponent;
  @ViewChild(CategoryStepComponent, {static: true}) public categoryStep: CategoryStepComponent;
  @ViewChild(FundingStepComponent, {static: true}) public fundingStep: FundingStepComponent;
  @ViewChild(ReviewStepComponent, {static: true}) public reviewStep: ReviewStepComponent;

  @Input() action: Action;

  public namedRisk: NamedRisk;
  public startingStep = 0;

  constructor(private session: WizardSessionService<Action>,
              private actionService: ActionService,
              private riskService: RiskService,
              private communitySystemService: CommunitySystemService,
              private weatherEventService: WeatherEventService,
              private route: ActivatedRoute,
              private location: Location) { }

  ngOnInit() {
    if (!this.action) {
      this.action = new Action({});

      const riskId: string = this.route.snapshot.paramMap.get('riskid');
      this.action.risk = riskId;

      if (this.route.snapshot.data['suggestedAction']) {
        const suggestion = this.route.snapshot.data['suggestedAction'] as Action;
        this.action.name = suggestion.name;
        this.action.action_type = suggestion.action_type;
        this.action.action_goal = suggestion.action_goal;
        this.action.implementation_details = suggestion.implementation_details;
        this.action.implementation_notes = suggestion.implementation_notes;
        this.action.improvements_adaptive_capacity = suggestion.improvements_adaptive_capacity;
        this.action.improvements_impacts = suggestion.improvements_impacts;
        this.action.collaborators = suggestion.collaborators;
        this.action.categories = suggestion.categories;
      }
    } else {
      // Only allow jumping to other steps if we're not creating
      //  a new action
      this.route.queryParams.take(1).subscribe((params: Params) => {
        const indexes = {
          'review': 5
        };
        // Default to the first step if the param doesn't match a valid step
        this.startingStep = indexes[params['step']] || 0;
      });
    }

    this.riskService.get(this.action.risk).subscribe(risk => {
      this.namedRisk = {
        'risk': risk,
        'name': `${risk.weather_event.name} on ${risk.community_system.name}`
      };
    });

    this.session.setData(this.action);

    // Update the URL with the action id once the action is saved
    this.session.data
      .first(action => action.id !== undefined)
      .subscribe((action) => {
        this.location.replaceState(`/actions/action/${action.id}`);
      });
  }

  // this.wizard.navigation and this.wizard.model are not available until this hook
  ngAfterViewInit() {}

  allStepsCompleted(): boolean {
    return this.assessStep.isStepComplete() && this.implementationStep.isStepComplete() &&
      this.improvementsStep.isStepComplete() && this.categoryStep.isStepComplete() &&
      this.fundingStep.isStepComplete();
  }

  public resetScroll() {
    window.scrollTo(0, 0);
  }
}
