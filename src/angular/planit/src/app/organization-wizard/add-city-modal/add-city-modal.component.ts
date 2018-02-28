import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-add-city-modal',
  templateUrl: './add-city-modal.component.html'
})
export class AddCityModalComponent implements OnInit {

  public url: string;
  public user: User;
  private modalRef: BsModalRef;

  constructor(private modalService: BsModalService,
              public router: Router,
              private authService: AuthService,
              public userService: UserService) { }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.userService.current().subscribe(u => this.user = u);
    }
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {animated: false});
  }
}
