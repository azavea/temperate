import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { onErrorResumeNext } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { RiskService } from '../../core/services/risk.service';

import { Action, Risk } from '../../shared';
import {
  ConfirmationModalComponent
} from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'va-assessment-overview-table',
  templateUrl: './assessment-overview-table.component.html'
})
export class AssessmentOverviewTableComponent implements OnInit {

  @ViewChild('confirmDeleteModal', {static: true}) confirmDeleteModal: ConfirmationModalComponent;
  @Input() risks: Risk[];
  @Output() risksChange = new EventEmitter<Risk[]>();
  @Input() showFullTitle = false;

  public tooltipText = {
    adaptiveCapacity: 'The ability to respond to change, deal with potential damage, and take ' +
                      'advantage of opportunities. It relates to built, natural, and social ' +
                      'systems, as well as institutions, humans, and other organisms. Systems ' +
                      'with High Adaptive Capacity are better able to cope with climate change ' +
                      'impacts.',
    potentialImpact: 'The degree to which the risk will affect the city overall.',
    risk: 'A potential future climate hazard and the social, civic, economic, or ecological ' +
          'system that may be affected.',
    communitySystem: 'The social, civic, economic, or ecological system that may be affected ' +
                     'by a potential future climate hazard'
  };
  constructor(private riskService: RiskService) { }

  ngOnInit() {
  }

  deleteRisk(risk: Risk) {
    this.confirmDeleteModal.confirm({
      tagline: `Are you sure you want to delete ${risk.title()}?`,
      confirmText: 'Delete'
    }).pipe(onErrorResumeNext, switchMap(() => this.riskService.delete(risk))
    ).subscribe(() => {
      this.risks = this.risks.filter(r => r.id !== risk.id);
      this.risksChange.emit(this.risks);
    });
  }

}
