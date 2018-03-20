import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { RiskService } from '../../core/services/risk.service';

import { Action, Risk } from '..';
import {
  ConfirmationModalComponent
} from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-assessment-overview-table',
  templateUrl: './assessment-overview-table.component.html'
})
export class AssessmentOverviewTableComponent implements OnInit {

  @ViewChild('confirmDeleteModal') confirmDeleteModal: ConfirmationModalComponent;
  @Input() risks: Risk[];

  public tooltipText = {
    adaptiveCapacity: 'The ability to respond to change, deal with potential damage, and take ' +
                      'advantage of opportunities. It relates to built, natural, and social ' +
                      'systems, as well as institutions, humans, and other organisms. Systems ' +
                      'with High Adaptive Capacity are better able to cope with climate change ' +
                      'impacts.',
    potentialImpact: 'The degree to which the risk will affect the city overall.',
    risk: 'A potential future climate hazard and the social, civic, economic, or ecological ' +
          'system that may be affected.'
  };
  constructor(private riskService: RiskService) { }

  ngOnInit() {
  }

  deleteRisk(risk: Risk) {
    this.confirmDeleteModal.confirm({
      tagline: `Are you sure you want to delete ${risk.title()}?`,
      confirmText: 'Delete'
    }).onErrorResumeNext().switchMap(() => {
      return this.riskService.delete(risk);
    }).subscribe(() => {
        this.risks = this.risks.filter(r => r.id !== risk.id);
    });
  }

}
