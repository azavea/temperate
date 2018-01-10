import { Component, OnInit } from '@angular/core';

import { Risk } from '../shared';
import { RiskService } from '../core/services/risk.service';

@Component({
  selector: 'va-overview',
  templateUrl: 'assessment-overview.component.html'
})
export class AssessmentOverviewComponent implements OnInit {
  public risks: Risk[];

  constructor (private riskService: RiskService) {}

  ngOnInit() {
    this.riskService.list().subscribe(risks => {
      this.risks = risks;
    });
  }

  deleteRisk(risk: Risk) {
    this.riskService.delete(risk).subscribe(() => {
      this.risks = this.risks.filter(r => r.id !== risk.id);
    });
  }
}
