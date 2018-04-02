import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { AlertModule } from 'ngx-bootstrap';

import { Observable } from 'rxjs/Rx';

import { RiskService } from '../core/services/risk.service';
import { Risk, WeatherEvent } from '../shared';
import { ModalTemplateComponent } from '../shared/modal-template/modal-template.component';

@Component({
  selector: 'as-overview',
  templateUrl: 'action-steps-overview.component.html'
})

export class ActionStepsOverviewComponent implements OnInit {
  @ViewChild('reviewYourPlanModal') reviewYourPlanModal: ModalTemplateComponent;

  public risks: Risk[];
  public allRisks: Risk[];
  public weatherEvent?: WeatherEvent;
  public showFirstActionMessage: Boolean = false;
  public showActionsCompleteMessage: Boolean = false;
  public showAllActionsCompleteMessage: Boolean = false;
  public fromWizard: Boolean = false;

  constructor (private riskService: RiskService,
               private route: ActivatedRoute) {}

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

  get areAnyRisksAssessed(): boolean {
    return Risk.areAnyRisksAssessed(this.risks);
  }
}
