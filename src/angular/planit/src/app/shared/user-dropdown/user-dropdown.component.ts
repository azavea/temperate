import { Component, OnInit } from '@angular/core';

import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/user.model';
import { Organization } from '../../shared/models/organization.model';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss']
})

export class UserDropdownComponent implements OnInit {
  public user: User;
  public organization: Organization;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.current()
      .do(user => this.user = user)
      .flatMap(user => this.userService.getPrimaryOrganization(user))
      .subscribe(organization => this.organization = organization);
  }
}
