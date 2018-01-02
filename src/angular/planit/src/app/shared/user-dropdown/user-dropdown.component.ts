import { Component, OnInit } from '@angular/core';

import { UserService } from '../../core/services/user.service';
import { User } from '../../shared';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss']
})

export class UserDropdownComponent implements OnInit {
  public user: User;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.current().subscribe(user => this.user = user);
  }
}
