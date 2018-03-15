import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Rx';

import { RiskService } from '../../core/services/risk.service';
import { UserService } from '../../core/services/user.service';
import { Organization, Risk } from '../../shared';
import { AccordionReviewState } from './tabs/adaptation-accordion-state.service';

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

  public activeTab = ReviewPlanTabs.OVERVIEW;
  public organization: Organization;
  public risks: Map<string, Risk[]>;
  public tabs = ReviewPlanTabs;

  private orgSubscription: Subscription;

  constructor(private accordionState: AccordionReviewState,
              private riskService: RiskService,
              private userService: UserService) { }

  ngOnInit() {
    this.userService.current().subscribe(user => this.organization = user.primary_organization);
    this.riskService.groupByWeatherEvent().subscribe(riskMap => this.sortAndSetRisks(riskMap));
    this.accordionState.isOpen = {};
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
