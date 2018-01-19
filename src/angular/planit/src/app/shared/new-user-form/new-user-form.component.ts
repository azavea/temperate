import { Component, EventEmitter, Output } from '@angular/core';

import { AccountCreateService } from '../../core/services/account-create.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-new-user-form',
  templateUrl: './new-user-form.component.html'
})
export class NewUserFormComponent {

  public model: User = new User({});

  public submitted = false;

  public errors: any[] = [];

  @Output() closed: EventEmitter<string> = new EventEmitter();

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
