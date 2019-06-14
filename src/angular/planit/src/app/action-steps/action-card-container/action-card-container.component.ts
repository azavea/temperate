import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { onErrorResumeNext } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
  @ViewChild('confirmDeleteModal', {static: true}) confirmDeleteModal: ConfirmationModalComponent;

  @Input() public risks: Risk[];
  @Output() public risksChange = new EventEmitter<Risk[]>();
  @Input() public showFullTitle = false;

  constructor(private actionService: ActionService) { }

  ngOnInit() {
  }

  deleteAction(action) {
    const risk = this.risks.find(r => r.action && r.action.id === action.id);
    this.confirmDeleteModal.confirm({
      tagline: `Are you sure you want to remove ${risk.title()}?`,
      confirmText: 'Remove'
    }).pipe(onErrorResumeNext, switchMap(() => this.actionService.delete(action))
    ).subscribe(a => {
      risk.action = null;
      this.risksChange.emit(this.risks);
    });
  }

}
