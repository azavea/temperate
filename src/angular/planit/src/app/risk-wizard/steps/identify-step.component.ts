import { AfterViewInit, OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';

import { WizardState } from 'ng2-archwizard/dist/navigation/wizard-state.model';

@Component({
  selector: 'app-risk-step-identify',
  templateUrl: 'identify-step.component.html'
})

export class IdentifyStepComponent implements AfterViewInit, OnInit {

  public navigationSymbol = '1';
  public title = 'Identify risk';

  public hazards: string[];
  public hazard: string;

  public communitySystems: string[];
  public communitySystem: string;

  constructor(private router: Router, private wizardState: WizardState) { }

  ngOnInit() {
    this.hazards = ['one', 'two', 'three'];
    this.communitySystems = ['four', 'five', 'six'];
  }

  ngAfterViewInit() {
    // Example of how to get current wizard step directive state in step components
    // Not available until the AfterViewInit hook
    console.log(this.wizardState.currentStep);
  }

  cancel() {
    this.router.navigate(['assessment']);
  }
}
