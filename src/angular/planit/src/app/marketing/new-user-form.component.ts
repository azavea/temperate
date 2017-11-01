import { Component, EventEmitter, Output } from '@angular/core';

import { AccountCreateService } from '../shared/services/account-create.service';
import { User } from '../shared/models/user.model';

@Component({
  selector: 'new-user-form',
  templateUrl: './new-user-form.component.html'
})
export class NewUserFormComponent {

  public model: User = new User({
    firstName: '',
    lastName: ''
  });

  @Output() closed: EventEmitter<string> = new EventEmitter();

  submitted = false;

  constructor(private accountCreateService: AccountCreateService) {}

  onSubmit() {
    console.log('onSubmit');
    this.submitted = true;
    console.log(this.model);
    console.log(JSON.stringify(this.model));
    this.accountCreateService.create(this.model).subscribe(data => {
      console.log('got response');
      console.log(data);
    });
  }

  onClose() {
    this.closed.emit('closed');
  }
}
