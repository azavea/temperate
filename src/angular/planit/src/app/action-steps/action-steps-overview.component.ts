import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import { ActionService } from '../core/services/action.service';
import { RiskService } from '../core/services/risk.service';
import { Action, Risk, WeatherEvent } from '../shared';
import {
  ConfirmationModalComponent
} from '../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'as-overview',
  templateUrl: 'action-steps-overview.component.html'
})

export class ActionStepsOverviewComponent implements OnInit {
  @ViewChild('confirmDeleteModal') confirmDeleteModal: ConfirmationModalComponent;

  public action: Action;
  public risks: Risk[];
  public weatherEvent?: WeatherEvent;

  constructor (private actionService: ActionService,
               private riskService: RiskService,
               private route: ActivatedRoute) {}

  ngOnInit() {
    if (this.route.snapshot.data['weatherEvent']) {
      this.weatherEvent = this.route.snapshot.data['weatherEvent'] as WeatherEvent;
      this.riskService.filterByWeatherEvent(this.weatherEvent.id)
        .subscribe(risks => this.risks = risks);
    } else {
      this.riskService.list().subscribe(risks => this.risks = risks);
    }
  }

  // Check if any of the risks have been assessed yet
  get isARiskAssessed(): boolean {
    return !!this.risks.find((risk: Risk) => risk.isAssessed());
  }

  deleteAction(action) {
    const risk = this.risks.find(r => r.action && r.action.id === action.id);
    this.confirmDeleteModal.confirm({
      tagline: `Are you sure you want to delete ${risk.title()}?`,
      confirmText: 'Delete'
    }).onErrorResumeNext().switchMap(() => {
      return this.actionService.delete(action);
    }).subscribe(a => {
      risk.action = null;
    });
  }
}
