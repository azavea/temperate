import { Component, Input, OnInit } from '@angular/core';

import { OrgRiskRelativeOption } from '../models/org-risk-relative-option.model';


@Component({
  selector: 'va-adaptive-need-box',
  templateUrl: 'adaptive-need-box.component.html'
})
export class AdaptiveNeedBoxComponent implements OnInit {
  @Input() potentialImpact: OrgRiskRelativeOption;
  @Input() adaptive_capacity: OrgRiskRelativeOption;
  @Input() popoverPlacement: string;

  public potentialImpactBin: number;
  public adaptiveCapacityBin: number;

  constructor () {
  }

  ngOnInit() {
    this.potentialImpactBin = this.binRelativeOption(this.potentialImpact);
    this.adaptiveCapacityBin = this.binRelativeOption(this.adaptive_capacity);
  }

  // takes a risk enum value and returns an integer between 0 and 4, or undefined if 'Unsure'
  private binRelativeOption(val: OrgRiskRelativeOption): number {
    if (val === OrgRiskRelativeOption.Low) {
      return 0;
    } else if (val === OrgRiskRelativeOption.ModeratelyLow) {
      return 1;
    } else if (val === OrgRiskRelativeOption.Moderate) {
      return 2;
    } else if (val === OrgRiskRelativeOption.ModeratelyHigh) {
      return 3;
    } else if (val === OrgRiskRelativeOption.High) {
      return 4;
    } else {
      // unsure
      return undefined;
    }
  }
}
