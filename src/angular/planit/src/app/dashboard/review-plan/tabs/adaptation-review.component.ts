import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import {
  Action,
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
}
