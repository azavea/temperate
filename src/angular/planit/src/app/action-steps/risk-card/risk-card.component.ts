import { Component,
        OnInit,
        Input,
        TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

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
