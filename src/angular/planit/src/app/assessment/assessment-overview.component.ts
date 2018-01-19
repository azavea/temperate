import { Component, OnInit } from '@angular/core';

import { RiskService } from '../core/services/risk.service';
import { Risk } from '../shared';

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
