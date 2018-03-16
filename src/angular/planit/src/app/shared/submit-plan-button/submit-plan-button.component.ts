import { Component, ViewChild } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { PlanService } from '../../core/services/plan.service';

import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-submit-plan-button',
  templateUrl: 'submit-plan-button.component.html'
})
export class SubmitPlanButtonComponent {

  @ViewChild('confirmSubmitModal') confirmSubmitModal: ConfirmationModalComponent;

  constructor(private toastr: ToastrService,
              private planService: PlanService) { }

  public submitPlan() {
    this.confirmSubmitModal.confirm({
      title: 'Submit your plan',
      tagline: 'Are you sure you\'re ready to submit your adaptation plan?',
      confirmButtonClass: 'button-primary',
      confirmText: 'Submit'
    }).onErrorResumeNext().switchMap(() => {
      return this.planService.submit();
    }).subscribe(() => {
      const success = `
        Thanks for submitting your adaptation plan!
        You will receive a copy of your submission via email.
      `;
      this.toastr.success(success);
    }, () => {
      const error = `
        There was an unexpected issue submitting your plan.
        Please try again in a few hours.
        If you continue to have trouble, contact support@temperate.io to submit your plan.
      `;
      this.toastr.error(error, undefined, {
        timeOut: 10000,
        closeButton: true
      });
    });
  }

}