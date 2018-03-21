import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { ActionService } from '../../core/services/action.service';
import { Action, Risk } from '../../shared';
import {
  ConfirmationModalComponent
} from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'as-action-card-container',
  templateUrl: './action-card-container.component.html'
})
export class ActionCardContainerComponent implements OnInit {
  @ViewChild('confirmDeleteModal') confirmDeleteModal: ConfirmationModalComponent;

  @Input() public risks: Risk[];

  constructor(private actionService: ActionService) { }

  ngOnInit() {
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
