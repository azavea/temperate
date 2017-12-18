import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';

import { ArchwizardModule } from 'ng2-archwizard';

import { RiskWizardComponent } from './risk-wizard.component';
import { IdentifyStepComponent } from './steps/identify-step.component';
import { HazardStepComponent } from './steps/hazard-step.component';
import { ReviewStepComponent } from './steps/review-step.component';
import { CapacityStepComponent } from './steps/capacity-step.component';
import { ImpactStepComponent } from './steps/impact-step.component';

import { TypeaheadModule } from 'ngx-bootstrap';

@NgModule({
    imports: [
        FormsModule,
        ArchwizardModule,
        TypeaheadModule
    ],
    exports: [RiskWizardComponent],
    declarations: [
        CapacityStepComponent,
        HazardStepComponent,
        IdentifyStepComponent,
        ImpactStepComponent,
        ReviewStepComponent,
        RiskWizardComponent
    ],
    providers: [],
})
export class RiskWizardModule { }
