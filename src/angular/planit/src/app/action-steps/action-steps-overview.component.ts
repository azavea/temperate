import { Component, OnInit } from '@angular/core';

import { Risk } from '../shared';
import { RiskService } from '../core/services/risk.service';

@Component({
  selector: 'as-overview',
  templateUrl: 'action-steps-overview.component.html'
})

export class ActionStepsOverviewComponent implements OnInit {

  public risks: Risk[];
  public haveAssessedRisks = false;
  public risksWithActionsCount: number;

  constructor (private riskService: RiskService) {}

  ngOnInit() {
    this.riskService.list().subscribe(risks => {
      this.risks = risks;
      // now that risks have been fetched, check if any have been assessed
      this.checkAssessedRisks();
      // get count of risks with actions
      this.getRisksWithActionsCount();
    });
  }

  // Check if any of the risks have been assessed yet
  // TODO: #405 implement another method/property for checking if assessed or not
  checkAssessedRisks() {
    for (const risk of this.risks) {
      if (risk.impactMagnitude || risk.adaptiveCapacity) {
        this.haveAssessedRisks = true;
        return;
      }
    }

    // if got this far, no risks found with assessment values set
    this.haveAssessedRisks = false;
  }

  // Count how many risks have associated actions, for the progress bar
  getRisksWithActionsCount() {
    this.risksWithActionsCount = 0;

    for (const risk of this.risks) {
      if (risk.relatedAdaptiveValues.length > 0) {
        this.risksWithActionsCount += 1;
      }
    }
  }

}
