import { Component, OnInit, Input } from '@angular/core';

import { Risk } from '../../shared';

@Component({
  selector: 'as-action-card',
  templateUrl: './action-card.component.html'
})
export class ActionCardComponent implements OnInit {

  @Input() risk: Risk;

  constructor() { }

  ngOnInit() {
  }

}
