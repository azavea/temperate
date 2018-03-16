import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';

import { Action, Risk } from '../../shared';

@Component({
  selector: 'as-action-card',
  templateUrl: './action-card.component.html'
})
export class ActionCardComponent implements OnInit, OnChanges {

  @Input() isOpen: boolean;
  @Input() risk: Risk;
  @Input() action: Action;
  @Output() delete = new EventEmitter<Action>();
  @Output() toggled: EventEmitter<boolean> = new EventEmitter();
  public actionNameLines = [];

  constructor() { }

  ngOnInit() {
    this.parseActionName();
  }

  ngOnChanges() {
    this.parseActionName();
  }

  public deleteAction() {
    this.delete.emit(this.action);
  }

  private parseActionName() {
    if (this.action.name) {
       this.actionNameLines  = this.action.name.split('\n').filter(line => line !== '');
    } else {
      this.actionNameLines = [];
    }
  }

  actionCardToggled() {
    this.isOpen = !this.isOpen;
    this.toggled.emit(this.isOpen);
  }
}
