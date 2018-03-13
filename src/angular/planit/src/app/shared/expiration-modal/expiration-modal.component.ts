import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-expiration-modal',
  templateUrl: './expiration-modal.component.html'
})
export class ExpirationModalComponent implements OnInit {
  @ViewChild('expirationModal') expirationModal: ModalDirective;

  constructor() { }

  ngOnInit() {
  }

  showModal(): void {
    this.expirationModal.show();
  }

  hideModal(): void {
    this.expirationModal.hide();
  }

}
