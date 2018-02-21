import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html'
})
export class HelpModalComponent implements OnInit {
  public modalRef: BsModalRef;
  public user: User;
  public url: string;

  constructor(private modalService: BsModalService,
              public router: Router,
              private authService: AuthService,
              private userService: UserService) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.userService.current().subscribe(u => this.user = u);
    }
    this.url = document.location.href;
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {animated: false});
  }
}
