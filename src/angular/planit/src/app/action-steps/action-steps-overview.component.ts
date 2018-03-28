import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { AlertModule } from 'ngx-bootstrap';

import { Observable } from 'rxjs/Rx';

import { ActionService } from '../core/services/action.service';
import { RiskService } from '../core/services/risk.service';
import { Action, Risk, WeatherEvent } from '../shared';
import {
  ConfirmationModalComponent
} from '../shared/confirmation-modal/confirmation-modal.component';
import { ModalTemplateComponent } from '../shared/modal-template/modal-template.component';

@Component({
  selector: 'as-overview',
  templateUrl: 'action-steps-overview.component.html'
})

export class ActionStepsOverviewComponent implements OnInit {
  @ViewChild('confirmDeleteModal') confirmDeleteModal: ConfirmationModalComponent;
  @ViewChild('reviewYourPlanModal') reviewYourPlanModal: ModalTemplateComponent;

  public action: Action;
  public risks: Risk[];
  public allRisks: Risk[];
  public weatherEvent?: WeatherEvent;
  public showFirstActionMessage: Boolean = false;
  public showActionsCompleteMessage: Boolean = false;
  public showAllActionsCompleteMessage: Boolean = false;
  public fromWizard: Boolean = false;

  constructor (private actionService: ActionService,
               private riskService: RiskService,
               private route: ActivatedRoute,
               private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      this.fromWizard = params['fromWizard'];
    });

    if (this.route.snapshot.data['weatherEvent']) {
      this.weatherEvent = this.route.snapshot.data['weatherEvent'] as WeatherEvent;

      this.riskService.list().subscribe((risks) => {
        this.allRisks = risks;
        this.risks = risks.filter(r => r.weather_event.id === this.weatherEvent.id);

        if (this.risks && this.fromWizard) {
          this.determineMessageVisibility();
        }
      });
    } else {
      this.riskService.list().subscribe(risks => this.risks = risks);
    }
  }

  // Check if any of the risks have been assessed yet
  get isARiskAssessed(): boolean {
    return !!this.risks.find((risk: Risk) => risk.isAssessed());
  }

  determineMessageVisibility(): void {
    let riskCount = 0;
    let actionCount = 0;
    let allRiskCount = 0;
    let allActionCount = 0;

    this.risks.forEach((risk) => {
      riskCount++;

      if (risk.action) {
        actionCount++;
      }
    });

    this.allRisks.forEach((risk) => {
      allRiskCount++;

      if (risk.action) {
        allActionCount++;
      }
    });

    if (allRiskCount === allActionCount) {
      this.openModal();
    } else if (actionCount === 1 && riskCount > 1) {
      this.showFirstActionMessage = true;
    } else if (riskCount === actionCount) {
      this.showActionsCompleteMessage = true;
    }
  }

  public openModal() {
    this.reviewYourPlanModal.open();
  }

  deleteAction(action) {
    const risk = this.risks.find(r => r.action && r.action.id === action.id);
    this.confirmDeleteModal.confirm({
      tagline: `Are you sure you want to remove ${risk.title()}?`,
      confirmText: 'Remove'
    }).onErrorResumeNext().switchMap(() => {
      return this.actionService.delete(action);
    }).subscribe(a => {
      risk.action = null;
    });
  }
}
