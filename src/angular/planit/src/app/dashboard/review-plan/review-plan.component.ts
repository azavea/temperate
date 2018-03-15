import { Component, OnInit, ViewChild } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Rx';

import { PlanService } from '../../core/services/plan.service';
import { RiskService } from '../../core/services/risk.service';
import { UserService } from '../../core/services/user.service';
import { Organization, Risk } from '../../shared';
import {
  ConfirmationModalComponent
} from '../../shared/confirmation-modal/confirmation-modal.component';
import { AccordionReviewState } from './tabs/adaptation-accordion-state.service';

import { environment } from '../../../environments/environment';

enum ReviewPlanTabs {
  OVERVIEW,
  CITY_PROFILE,
  ADAPTATION_PLAN
}

@Component({
  selector: 'app-review-plan',
  templateUrl: 'review-plan.component.html',
  providers: [AccordionReviewState]
})
export class ReviewPlanComponent implements OnInit {

  @ViewChild('confirmSubmitModal') confirmSubmitModal: ConfirmationModalComponent;

  public activeTab = ReviewPlanTabs.OVERVIEW;
  public organization: Organization;
  public risks: Map<string, Risk[]>;
  public tabs = ReviewPlanTabs;

  private orgSubscription: Subscription;

  constructor(private accordionState: AccordionReviewState,
              public planService: PlanService,
              private riskService: RiskService,
              private toastr: ToastrService,
              private userService: UserService) { }

  ngOnInit() {
    this.userService.current().subscribe(user => this.organization = user.primary_organization);
    this.riskService.groupByWeatherEvent().subscribe(riskMap => this.sortAndSetRisks(riskMap));
    this.accordionState.isOpen = {};
  }

  public submitPlan() {
    this.confirmSubmitModal.confirm({
      title: 'Submit your plan',
      tagline: 'Are you sure you\'re ready to submit your adaptation plan?',
      confirmButtonClass: 'button-primary',
      confirmText: 'Submit'
    }).onErrorResumeNext().switchMap(() => {
      return this.planService.submit();
    }).subscribe(() => {
      const success = `
        Thanks for submitting your adaptation plan!
        You will receive a copy of your submission via email.
      `;
      this.toastr.success(success);
    }, () => {
      const error = `
        There was an unexpected issue submitting your plan.
        Please try again in a few hours.
        If you continue to have trouble, contact support@temperate.io to submit your plan.
      `;
      this.toastr.error(error, undefined, {
        timeOut: 10000,
        closeButton: true
      });
    });
  }

  private sortAndSetRisks(riskMap: Map<string, Risk[]>) {
    // First create new map that resorts keys alphabetically
    const sortedKeysRiskMap = new Map<string, Risk[]>(
      Array.from(riskMap.entries()).sort((a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0)
    );

    // Reduce map to array of risks, sorted first by weather event name, then community system
    //  name
    const sortedRisks = Array.from(sortedKeysRiskMap.values()).reduce((prev, current) => {
      current.sort((a, b) => {
        const aName = a.community_system.name.toLocaleUpperCase();
        const bName = b.community_system.name.toLocaleUpperCase();
        return aName > bName ? 1 : aName < bName ? -1 : 0;
      });
      return prev.concat(current);
    }, [] as Risk[]);
    console.log(sortedRisks);
    this.risks = riskMap;
  }
}
