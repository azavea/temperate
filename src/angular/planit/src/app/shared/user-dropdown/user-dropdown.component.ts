import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { OrgSubscriptionOptions, User } from '../../shared';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss']
})

export class UserDropdownComponent implements OnInit {
  public user: User;
  public subscriptionOptions = OrgSubscriptionOptions;

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.userService.current().subscribe(user => this.user = user);
  }

  public logout() {
    this.authService.logout();
  }
}
