import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'ng2-archwizard';

import { WizardSessionService } from '../core/services/wizard-session.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ArchwizardModule
  ],
  /* Abstract classes are used directly, not handled by NgModule */
  declarations: [],
  exports: []
})
export class WizardModule { }
