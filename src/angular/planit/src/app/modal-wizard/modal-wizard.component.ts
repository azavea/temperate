import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModalOptions } from 'ngx-bootstrap/modal/modal-options.class';

import { ModalWizardOptions } from './modal-wizard-options';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.directive';

@Component({
    selector: 'app-modal-wizard',
    template: ''
})

export class ModalWizardComponent implements OnInit {

  @Input() component: any;
  @Input() modalOptions: ModalOptions;

  public modalRef: BsModalRef;

  constructor(private modalService: BsModalService) { }

  ngOnInit() {
    this.modalRef = this.showWizardModal();
  }

  showWizardModal() {
    const options = Object.assign({}, ModalWizardOptions, this.modalOptions);
    return this.modalService.show(this.component, options);
  }
}
