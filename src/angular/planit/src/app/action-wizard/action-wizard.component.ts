import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

// Import from root doesn't seem to pickup types, so import directly from file
import { WizardComponent } from 'ng2-archwizard/dist/components/wizard.component';

import { AssessStepComponent } from './steps/assess-step/assess-step.component';
import { CategoryStepComponent } from './steps/category-step/category-step.component';
import { FundingStepComponent } from './steps/funding-step/funding-step.component';
import { ImplementationStepComponent } from './steps/implementation-step/implementation-step.component';
import { ImprovementsStepComponent } from './steps/improvements-step/improvements-step.component';
import { ReviewStepComponent } from './steps/review-step/review-step.component';
import { Action, Risk } from '../shared';
import { WizardSessionService } from '../core/services/wizard-session.service';

@Component({
  selector: 'app-action-wizard',
  templateUrl: './action-wizard.component.html',
  providers: [WizardSessionService]
})
export class ActionWizardComponent implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild(WizardComponent) public wizard: WizardComponent;
  @ViewChild(AssessStepComponent) public assessStep: AssessStepComponent;
  @ViewChild(ImplementationStepComponent) public implemationStep: ImplementationStepComponent;
  @ViewChild(ImprovementsStepComponent) public improvementsStep: ImprovementsStepComponent;
  @ViewChild(CategoryStepComponent) public categoryStep: CategoryStepComponent;
  @ViewChild(FundingStepComponent) public fundingStep: FundingStepComponent;
  @ViewChild(ReviewStepComponent) public reviewStep: ReviewStepComponent;

  constructor(private session: WizardSessionService<Action>) { }

  ngOnInit() {
/*    const risk1 = new Risk({
      communitySystem: { name: '' },
      weatherEvent: { name: '' }
    });
    const action = new Action({
        name: '',
        risk: risk1
    });
    this.session.setData(action);
    this.session.data.subscribe(a => this.actionModelChanged(a));*/
  }

  ngOnDestroy() {
   // this.session.data.unsubscribe();
  }

  // this.wizard.navigation and this.wizard.model are not available until this hook
  ngAfterViewInit() {}

  actionModelChanged(action: Action) {
   // console.log(action);
  }
}
