
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';

import { WizardState } from 'ng2-archwizard/dist/navigation/wizard-state.model';

@Component({
  selector: 'va-new-risk-step-identify',
  templateUrl: 'identify-step.component.html'
})

export class IdentifyStepComponent implements AfterViewInit {

  public navigationSymbol = '1';
  public title = 'Identify risk';

  constructor(private router: Router, private wizardState: WizardState) { }

  ngAfterViewInit() {
    // Example of how to get current wizard step directive state in step components
    // Not available until the AfterViewInit hook
    console.log(this.wizardState.currentStep);
  }

  cancel() {
    this.router.navigate(['assessment']);
  }
}
