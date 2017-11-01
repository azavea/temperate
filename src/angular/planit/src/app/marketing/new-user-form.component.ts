import { Component, EventEmitter, Output } from '@angular/core';

import { AccountCreateService } from '../core/services/account-create.service';
import { User } from '../shared/models/user.model';

@Component({
  selector: 'new-user-form',
  templateUrl: './new-user-form.component.html'
})
export class NewUserFormComponent {

  public model: User = new User({});

  public errors: any[] = [];

  @Output() closed: EventEmitter<string> = new EventEmitter();

  submitted = false;

  constructor(private accountCreateService: AccountCreateService) {}

  onSubmit() {
    this.accountCreateService.create(this.model).subscribe(newUser => {
      this.submitted = true;
      this.model = newUser;
    }, error => {
      this.errors = error.json();
    });
  }

  onClose() {
    this.closed.emit('closed');
  }
}
