import { Component, TemplateRef, OnInit, ViewChild  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';


@Component({
  selector: 'app-marketing',
  templateUrl: './marketing.component.html',
  styleUrls: []
})
export class MarketingComponent implements OnInit {
  @ViewChild("passwordResetForm", {read: TemplateRef}) passwordResetForm: TemplateRef<any>;

  public modalRef: BsModalRef;
    constructor(private modalService: BsModalService,
                private route: ActivatedRoute,
                private router: Router) {}

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {animated: false});
  }

  public ngOnInit() {
    if(this.route.snapshot.paramMap.get('token')) {
      this.openModal(this.passwordResetForm);
    }
  }
}
