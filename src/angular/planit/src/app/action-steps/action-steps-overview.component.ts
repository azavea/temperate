import { Component, OnInit } from '@angular/core';

import { ActionService } from '../core/services/action.service';
import { RiskService } from '../core/services/risk.service';
import { Action, Risk } from '../shared';

@Component({
  selector: 'as-overview',
  templateUrl: 'action-steps-overview.component.html'
})

export class ActionStepsOverviewComponent implements OnInit {

  public haveAssessedRisks = false;
  public risks: Risk[];
  public risksWithActionsCount: number;
  public risksWithoutActions: Risk[];
  public actions: Action[];

  constructor (private riskService: RiskService,
               private actionService: ActionService) {}

  ngOnInit() {
    this.getAndSetRisks();
    this.actionService.list().subscribe(actions => this.actions = actions);
  }

  getAndSetRisks() {
    this.riskService.list().subscribe(risks => {
      this.risks = risks;
      // now that risks have been fetched, check if any have been assessed
      this.haveAssessedRisks = this.isARiskAssessed();
      // get count of risks with actions
      this.getRisksWithActionsCount();
      this.getRisksWithoutActions();
    });
  }

  // Check if any of the risks have been assessed yet
  isARiskAssessed(): boolean {
    return !!this.risks.find((risk: Risk) => risk.isAssessed());
  }

  getMatchingRiskFromId(action: Action) {
    return this.risks.find(risk => risk.id === action.risk);
  }

  // Count how many risks have associated actions, for the progress bar
  getRisksWithActionsCount() {
    this.risksWithActionsCount = this.risks.reduce((ct: number, risk: Risk) =>
      ct += risk.action ? 1 : 0, 0);
  }

  getRisksWithoutActions() {
    this.risksWithoutActions = this.risks.filter(risk => !risk.action);
  }

  // Refresh actions, risks and their counts when an action is deleted
  onActionDeleted(action) {
    this.actionService.delete(action).subscribe(a => {
      this.actionService.list().subscribe(actions => this.actions = actions);
      this.getAndSetRisks();
    });
  }
}
