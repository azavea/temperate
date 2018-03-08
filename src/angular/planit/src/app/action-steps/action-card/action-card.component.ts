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

  constructor() { }

  ngOnInit() { }

  public deleteAction() {
    this.delete.emit(this.action);
  }
}
