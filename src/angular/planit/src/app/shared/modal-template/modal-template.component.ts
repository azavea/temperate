import { Component, Input, TemplateRef, ViewChild } from '@angular/core';

import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-modal-template',
  templateUrl: './modal-template.component.html'
})
export class ModalTemplateComponent {
  @Input() title: String;
  @Input() modalOptions: ModalOptions;

  public modalRef: BsModalRef;

  @ViewChild(TemplateRef, {static: true})
  private modal: TemplateRef<any>;

  private defaults: ModalOptions = {animated: false, class: 'modal-lg'};

  constructor (private modalService: BsModalService) {}

  public open() {
    const options = Object.assign({}, this.defaults, this.modalOptions);
    this.modalRef = this.modalService.show(this.modal, options);
  }

  public close() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  public get isCloseVisible() {
    const options = Object.assign({}, this.defaults, this.modalOptions);
    return !options.ignoreBackdropClick || options.keyboard !== false;
  }
}
