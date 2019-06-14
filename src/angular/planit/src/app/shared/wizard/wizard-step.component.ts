/*
 * A generic set of properties/methods that each step in a wizard should implement
 *
 * Depends on the WizardSessionService, concrete subclasses should determine its type.
 */
import { OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { MovingDirection } from 'ng2-archwizard';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { WizardSessionService } from '../../core/services/wizard-session.service';

export abstract class WizardStepComponent<T, FormModel> implements OnInit {

  public form: FormGroup;
  abstract key: string;
  abstract navigationSymbol: string;
  abstract title: string;

  abstract fromModel(model: T): FormModel;
  abstract setupForm(data: FormModel): void;
  abstract toModel(data: FormModel, model: T): T;
  abstract getFormModel(): FormModel;
  abstract persistChanges(model: T): Observable<T>;

  // Subclass constructors must also inject WizardSessionService and call:
  //  super(session, toastr);
  constructor(protected session: WizardSessionService<T>,
              protected toastr: ToastrService) {}

  // Subclass ngOnInit methods must implement ngOnInit and call `super.ngOnInit()` first in
  //  their implementations
  ngOnInit() {
    this.registerModelHandlers();
  }

  registerModelHandlers() {
    this.session.registerHandlerForKey(this.key, {
      fromData: this.fromModel,
      toData: this.toModel
    });
  }

  shouldSave() {
    return this.form ? this.form.dirty : true;
  }

  // For inexplicable reasons, we lose access to 'this' if 'save' is
  // declared as a method instead of as a named lambda
  public save: (MovingDirection?) => Promise<boolean> = (dir) => {
    if (!this.shouldSave()) {
      return Promise.resolve(true);
    }

    const data = this.getFormModel();
    this.session.setDataForKey(this.key, data);
    const model = this.session.getData();

    const saveStream = this.persistChanges(model);

    // Returning a promise with a true value will allow advancing to the next step
    return saveStream
      .pipe(tap(savedModel => {
        this.session.setData(savedModel);
      }), map(() => true), catchError((response) => {
        const code = response.status;
        const genericError = 'Something went wrong. Please refresh the page and try again.';
        const genericRecoverableError = 'Something went wrong. Please try again.';

        if (code === 400) {
          // Show the non-field error(s) in Toast, map form-field errors to
          // controls
          const errors = response.json();
          const {non_field_errors, ...otherErrors} = errors;

          // Put field-specific errors into the form controls so they can be
          // shown in the template for the individual step
          for (const [field, fieldErrors] of Object.entries(otherErrors)) {
            if (field in this.form.controls) {
              this.form.controls[field].setErrors({server: fieldErrors});
            }
          }

          // If there are non-field errors show them in toast, otherwise we
          // show a generic message in case the user misses the field-specific error
          if (non_field_errors && non_field_errors.length > 0) {
            const message = non_field_errors.join(', ');
            this.toastr.warning(message);
          } else {
            this.toastr.warning(genericRecoverableError);
          }

        } else {
          this.toastr.error(genericError);
        }
        return of(false);
      })).toPromise();
  }
}
