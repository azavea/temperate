import {
  Component,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { ModalTemplateComponent } from '../modal-template/modal-template.component';

export interface ConfirmModalConfig {
  title?: string;
  tagline?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  confirmText?: string;
}

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: 'confirmation-modal.component.html'
})
export class ConfirmationModalComponent implements OnDestroy {

  @ViewChild('modal') modal: ModalTemplateComponent;

  public cancelText: string;
  public confirmButtonClass: string;
  public confirmText: string;
  public title: string;
  public tagline: string;

  private _confirm?: Subject<void>;
  private _defaultConfig = {
    title: 'Are you sure?',
    tagline: undefined,
    cancelText: 'Cancel',
    confirmButtonClass: 'button-danger',
    confirmText: 'Continue'
  };

  // Automatically cancel request if component exits view hierarchy
  ngOnDestroy() {
    this.close(false);
  }

  // Complete the observable if confirmed, throw if cancelled, then close the modal
  public close(isConfirmed: boolean) {
    if (this._confirm) {
      if (isConfirmed) {
        this._confirm.next();
        this._confirm.complete();
      } else {
        this._confirm.error('cancelled');
      }
      this._confirm = undefined;
    }
    this.modal.close();
  }

  public confirm(config: ConfirmModalConfig): Observable<void> {
    // Cancel any pending open confirmation requests
    if (this._confirm) {
      this.close(false);
    }
    this._confirm = new Subject<void>();
    const options = Object.assign({}, this._defaultConfig, config);
    this.title = options.title;
    this.tagline = options.tagline;
    this.cancelText = options.cancelText;
    this.confirmButtonClass = options.confirmButtonClass;
    this.confirmText = options.confirmText;
    this.modal.open();
    return this._confirm.asObservable();
  }
}
