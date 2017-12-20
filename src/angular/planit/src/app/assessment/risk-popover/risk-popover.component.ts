import { Component, OnInit, Input } from '@angular/core';

import { Risk } from '../../shared/models/risk.model';


@Component({
  selector: 'va-risk-popover',
  templateUrl: 'risk-popover.component.html'
})
export class RiskPopoverComponent implements OnInit {
  @Input() risk: Risk;

  constructor () {}

  ngOnInit() {
  }
}
