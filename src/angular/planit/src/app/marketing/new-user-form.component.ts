import { Component } from '@angular/core';

import { User } from '../shared/models/user.model';

@Component({
  selector: 'new-user-form',
  templateUrl: './new-user-form.component.html'
})
export class NewUserFormComponent {

  public model: User = new User({});

  submitted = false;

  onSubmit() {
    this.submitted = true;
    console.log(JSON.stringify(this.model));
  }
}
