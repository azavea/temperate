import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import {
  Action,
  OrgRiskAdaptiveCapacityOptions,
  OrgRiskDirectionalFrequencyOptions,
  OrgRiskDirectionalIntensityOptions,
  OrgRiskDirectionalOption,
  OrgRiskRelativeChanceOptions,
  OrgRiskRelativeImpactOptions,
  OrgRiskRelativeOption,
  Risk
} from '../../../shared';
import { AccordionReviewState } from './adaptation-accordion-state.service';

@Component({
  selector: 'app-adaptation-review',
  templateUrl: 'adaptation-review.component.html'
})
export class AdaptationReviewComponent implements OnChanges {

  @Input() risks: Map<string, Risk[]>;

  public groupedRisks: Array<any>;

  constructor(public accordionState: AccordionReviewState) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.risks && changes.risks.currentValue) {
      this.groupedRisks = Array.from((changes.risks.currentValue as Map<string, Risk[]>).entries());
    } else {
      this.groupedRisks = undefined;
    }
  }

  public getActionCategoriesAsCSV(action?: Action): string | undefined {
    if (!action) { return undefined; }
    return action.categories.map(c => c.name).join(', ');
  }

  public getAdaptiveCapacityOptionText(opt: OrgRiskRelativeOption) {
    if (!opt) { return undefined; }
    return OrgRiskAdaptiveCapacityOptions.get(opt).label;
  }

  public getDirectionalFrequencyOptionText(opt: OrgRiskDirectionalOption) {
    if (!opt) { return undefined; }
    return OrgRiskDirectionalFrequencyOptions.get(opt).label;
  }

  public getDirectionalIntensityOptionText(opt: OrgRiskDirectionalOption) {
    if (!opt) { return undefined; }
    return OrgRiskDirectionalIntensityOptions.get(opt).label;
  }

  public getRelativeChanceOptionText(opt: OrgRiskRelativeOption) {
    if (!opt) { return undefined; }
    return OrgRiskRelativeChanceOptions.get(opt).label;
  }

  public getRelativeImpactOptionText(opt: OrgRiskRelativeOption) {
    if (!opt) { return undefined; }
    return OrgRiskRelativeImpactOptions.get(opt).label;
  }
}
