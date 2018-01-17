import { Component, OnInit } from '@angular/core';

import { OrgRiskRelativeOption, Risk } from '../shared';
import { RiskService } from '../core/services/risk.service';

@Component({
  selector: 'as-overview',
  templateUrl: 'action-steps-overview.component.html'
})

export class ActionStepsOverviewComponent implements OnInit {

  public haveAssessedRisks = false;
  public risks: Risk[];
  public risksWithActionsCount: number;

  constructor (private riskService: RiskService) {}

  ngOnInit() {
    this.riskService.list().subscribe(risks => {
      this.risks = risks;
      // now that risks have been fetched, check if any have been assessed
      this.haveAssessedRisks = this.isARiskAssessed();
      // get count of risks with actions
      this.getRisksWithActionsCount();
    });
  }

  // Check if any of the risks have been assessed yet
  isARiskAssessed(): boolean {
    return !!this.risks.find((risk: Risk) => risk.isAssessed());
  }

  // Count how many risks have associated actions, for the progress bar
  // TODO: #428 modify to count associated actions, once relationship to risks exists
  getRisksWithActionsCount() {
    this.risksWithActionsCount = this.risks.reduce((ct: number, risk: Risk) =>
      ct += risk.relatedAdaptiveValues.length ? 1 : 0, 0);
  }
}
