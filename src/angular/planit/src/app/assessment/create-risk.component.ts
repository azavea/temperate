import { Component, OnInit, ViewChild } from '@angular/core';

import { NewRiskWizardComponent } from './new-risk-wizard/new-risk-wizard.component';

@Component({
    selector: 'va-create-risk',
    templateUrl: 'create-risk.component.html'
})
export class CreateRiskComponent implements OnInit {

    public wizardComponent = NewRiskWizardComponent;

    constructor() { }

    ngOnInit() {}
}
