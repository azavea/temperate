import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Action } from '../../shared/';

@Component({
  selector: 'as-edit-action',
  templateUrl: 'edit-action.component.html'
})

export class EditActionComponent implements OnInit {

  public action: Action;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.route.snapshot.data['action']) {
      this.action = this.route.snapshot.data['action'] as Action;
    }
  }

}
