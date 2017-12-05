import { Component, OnInit, ViewChild } from '@angular/core';

import { WizardComponent } from 'ng2-archwizard';

@Component({
    selector: 'va-new-risk-wizard',
    templateUrl: 'new-risk-wizard.component.html'
})
export class NewRiskWizardComponent implements OnInit {

    @ViewChild("wizard") wizard: WizardComponent;

    constructor() { }

    ngOnInit() { }

    onWizardFinish() {
        console.log("Wizard done!");
    }
}
