import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { UserService } from '../../core/services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.scss']
})
export class HelpModalComponent implements OnInit {
  public modalRef: BsModalRef;
  public user: User;

  constructor(private modalService: BsModalService,
              private userService: UserService,
              private router: Router) {}

  ngOnInit() {
    this.userService.current().subscribe(u => this.user = u);
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {animated: false});
  }

}
