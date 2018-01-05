import { Component, OnInit } from '@angular/core';

import { RiskService } from '../core/services/risk.service';
import { Risk } from '../shared';

@Component({
  selector: 'as-overview',
  templateUrl: 'action-steps-overview.component.html'
})

export class ActionStepsOverviewComponent implements OnInit {

  public risks: Risk[];

  constructor(private riskService: RiskService) { }

  ngOnInit() {
    this.riskService.list().subscribe(risks => this.risks = risks);
  }

}
