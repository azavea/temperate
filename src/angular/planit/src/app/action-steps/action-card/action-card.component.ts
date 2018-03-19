import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { Action, Risk } from '../../shared';

@Component({
  selector: 'as-action-card',
  templateUrl: './action-card.component.html'
})
export class ActionCardComponent implements OnInit {

  @Input() risk: Risk;
  @Input() action: Action;
  @Output() delete = new EventEmitter<Action>();
  public actionNameLines = [];
  public isOpen = false;

  constructor() { }

  ngOnInit() {
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

  private actionCardToggled() {
    this.isOpen = !this.isOpen;
  }
}
