import { Component, OnInit, Input } from '@angular/core';

import { OrgRiskRelativeOption } from '../../shared';


@Component({
  selector: 'va-adaptive-need-box',
  templateUrl: 'adaptive-need-box.component.html'
})
export class AdaptiveNeedBoxComponent implements OnInit {
  @Input() potentialImpact: OrgRiskRelativeOption;
  @Input() adaptiveCapacity: OrgRiskRelativeOption;

  public potentialImpactBin: number;
  public adaptiveCapacityBin: number;

  constructor () {
  }

  ngOnInit() {
    this.potentialImpactBin = this.binRelativeOption(this.potentialImpact);
    this.adaptiveCapacityBin = this.binRelativeOption(this.adaptiveCapacity);
  }

  // takes a risk enum value and returns an integer between 0 and 2, or undefined if 'Unsure'
  private binRelativeOption(val: OrgRiskRelativeOption): number {
    if (val === OrgRiskRelativeOption.Low) {
      // low
      return 0;
    } else if (val === OrgRiskRelativeOption.Moderate ||
               val === OrgRiskRelativeOption.ModeratelyLow ||
               val === OrgRiskRelativeOption.ModeratelyHigh) {
      // medium
      return 1;
    } else if (val === OrgRiskRelativeOption.High) {
      // high
      return 2;
    } else {
      // unsure
      return undefined;
    }
  }
}
