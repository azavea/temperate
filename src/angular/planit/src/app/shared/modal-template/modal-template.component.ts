import { Component, Input, TemplateRef, ViewChild } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-modal-template',
  templateUrl: './modal-template.component.html'
})
export class ModalTemplateComponent {
  @Input() title: String;
  public modalRef: BsModalRef;

  @ViewChild(TemplateRef)
  private modal: TemplateRef<any>;

  constructor (private modalService: BsModalService) {}

  public open() {
    this.modalRef = this.modalService.show(this.modal, {animated: false});
  }

  public close() {
    this.modalRef.hide();
  }
}
