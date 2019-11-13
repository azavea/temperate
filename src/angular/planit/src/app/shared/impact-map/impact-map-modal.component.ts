import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';

import { Impact } from '../../shared';

@Component({
  selector: 'app-impact-map-modal',
  templateUrl: './impact-map-modal.component.html'
})
export class ImpactMapModalComponent {

  @Input() impacts: Impact[];
  @Input() title: string;

  @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

  public onModalShown: EventEmitter<any>;

  constructor() {}

  public show() {
    this.modal.show();
  }

}
