import { Component, Input, OnInit } from '@angular/core';

import {
  OrgRiskRelativeOption,
  relativeOptionToNumber
} from '../models/org-risk-relative-option.model';

@Component({
  selector: 'va-adaptive-need-box',
  templateUrl: 'adaptive-need-box.component.html'
})
export class AdaptiveNeedBoxComponent implements OnInit {
  @Input() potentialImpact: OrgRiskRelativeOption;
  @Input() adaptiveCapacity: OrgRiskRelativeOption;
  @Input() popoverPlacement: string;

  public potentialImpactBin: number;
  public adaptiveCapacityBin: number;

  constructor () {
  }

  ngOnInit() {
    this.potentialImpactBin = relativeOptionToNumber(this.potentialImpact);
    this.adaptiveCapacityBin = relativeOptionToNumber(this.adaptiveCapacity);
  }
}
