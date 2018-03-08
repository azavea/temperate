import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Risk } from '../../shared/';

@Component({
  selector: 'va-edit-risk',
  templateUrl: 'edit-risk.component.html'
})

export class EditRiskComponent implements OnInit {

  public risk: Risk;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.route.snapshot.data['risk']) {
      this.risk = this.route.snapshot.data['risk'] as Risk;
    }
  }
}
