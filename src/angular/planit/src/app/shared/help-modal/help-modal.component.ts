import { Component, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.scss']
})
export class HelpModalComponent {
  public modalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {animated: false});
  }
}
