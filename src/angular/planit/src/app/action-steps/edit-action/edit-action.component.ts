import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Action } from '../../shared/';

@Component({
  selector: 'as-edit-action',
  templateUrl: 'edit-action.component.html'
})

export class EditActionComponent implements OnInit {

  public action: Action;

  constructor(private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    if (this.route.snapshot.data['action']) {
      this.action = this.route.snapshot.data['action'] as Action;
    }

    this.route.params.subscribe(params => {
      if (!params.riskid && !params.id) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

}
