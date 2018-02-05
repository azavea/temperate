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
  @Input() actions: Action[];
  @Output() delete = new EventEmitter<Action>();

  public action: Action;

  constructor() { }

  ngOnInit() {
    this.action = this.actions[0];
  }

  public deleteAction() {
    this.delete.emit(this.action);
  }
}
