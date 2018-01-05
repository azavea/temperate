import { Component, OnInit } from '@angular/core';

import { Risk } from '../shared';
import { RiskService } from '../core/services/risk.service';

@Component({
  selector: 'as-overview',
  templateUrl: 'action-steps-overview.component.html'
})

export class ActionStepsOverviewComponent implements OnInit {

  public risks: Risk[];
  public haveAssessedRisks: boolean = false;

  constructor (private riskService: RiskService) {}

  ngOnInit() {
    this.riskService.list().subscribe(risks => {
      this.risks = risks;
      // now that risks have been fetched, check if any have been assessed
      checkAssessedRisks();
    });
  }

  // Check if any of the risks have been assessed yet
  checkAssessedRisks() {
    for (let risk: Risk in this.risks) {
      if (risk.potentialImpact || risk.adaptiveCapacity) {
        this.haveAssessedRisks = true;
        return;
      }
    }

    // if got this far, no risks found with assessment values set
    this.haveAssessedRisks = false;
  }

}
