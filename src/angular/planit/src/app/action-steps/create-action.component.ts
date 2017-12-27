import { Component, OnInit, ViewChild } from '@angular/core';

import { ActionWizardComponent } from '../action-wizard/';

@Component({
  selector: 'as-create-action',
  templateUrl: 'create-action.component.html'
})
export class CreateActionComponent implements OnInit {

  public wizardComponent = ActionWizardComponent;

  constructor() { }

  ngOnInit() {}
}
