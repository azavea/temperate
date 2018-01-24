import {
  Component,
  Input,
  OnInit,
  TemplateRef
} from '@angular/core';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { Risk } from '../../shared';

@Component({
  selector: 'as-risk-card',
  templateUrl: './risk-card.component.html'
})
export class RiskCardComponent implements OnInit {

  @Input() risk: Risk;

  public modalRef: BsModalRef;

  constructor(private modalService: BsModalService) { }

  ngOnInit() { }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {animated: false, class: 'modal-lg'});
  }
}