import { Component, Input, OnInit } from '@angular/core';

import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss']
})

export class UserDropdownComponent implements OnInit {
  @Input() user: User;

  constructor() {
    // TODO: Get this from Django (GH #98)
    this.user = new User({first_name: 'Mike', last_name: 'M', email: 'mike@mike.com'});
  }

  ngOnInit() {
      console.log(this.user.first_name);
  }

}
