import { Component } from '@angular/core';

import { User } from '../shared/models/user.model';

@Component({
  selector: 'new-user-form',
  templateUrl: './new-user-form.component.html'
})
export class NewUserFormComponent {

  model = null; //new User();

  submitted = false;

  onSubmit() { this.submitted = true; }

  // TODO: Remove this when we're done
  get diagnostic() { return JSON.stringify(this.model); }
}
