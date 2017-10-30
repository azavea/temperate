import { Component, EventEmitter, Output } from '@angular/core';

import { User } from '../shared/models/user.model';

@Component({
  selector: 'new-user-form',
  templateUrl: './new-user-form.component.html'
})
export class NewUserFormComponent {

  public model: User = new User({});

  @Output() closed: EventEmitter<string> = new EventEmitter();

  submitted = false;

  onSubmit() {
    console.log('onSubmit');
    this.submitted = true;
    console.log(JSON.stringify(this.model));
  }

  onClose() {
    this.closed.emit('closed');
  }
}
