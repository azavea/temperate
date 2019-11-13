import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import { ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';

import { Impact } from '../../shared';

@Component({
  selector: 'app-impact-map-modal',
  templateUrl: './impact-map-modal.component.html'
})
export class ImpactMapModalComponent implements AfterViewInit {

  @Input() impacts: Impact[];
  @Input() impact: Impact;
  @Input() title: string;
  @Output() modalHide = new EventEmitter<any>();

  @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

  constructor() {}

  ngAfterViewInit() {
    this.modal.onHide.subscribe(() => this.modalHide.emit());
  }

  public show() {
    this.modal.show();
  }

}
