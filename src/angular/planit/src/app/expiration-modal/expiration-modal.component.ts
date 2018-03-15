import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { UserService } from '../core/services/user.service';
import { OrgSubscriptionOptions, User } from '../shared';

@Component({
  selector: 'app-expiration-modal',
  templateUrl: './expiration-modal.component.html'
})
export class ExpirationModalComponent implements OnInit {
  @ViewChild('expirationModal') expirationModal: ModalDirective;
  public isModalShown = true;
  public user: User;
  public options = OrgSubscriptionOptions;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.current().subscribe(u => this.user = u);
    this.showModal();
  }

  private showModal(): void {
    this.isModalShown = true;
  }
}
