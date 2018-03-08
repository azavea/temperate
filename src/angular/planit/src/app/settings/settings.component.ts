import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { OrganizationService } from '../core/services/organization.service';
import { UserService } from '../core/services/user.service';
import { User } from '../shared';

import { EditableInputComponent } from './editable-input/editable-input.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @ViewChildren(EditableInputComponent) inputs: QueryList<EditableInputComponent>;

  public user: User;

  constructor(private organizationService: OrganizationService,
              private toastr: ToastrService,
              private userService: UserService) { }

  ngOnInit() {
    this.userService.current().subscribe(user => this.user = user);
  }

  userSave() {
    this.save(this.userService.update(this.user), 'Your user profile has been updated.');
  }

  organizationSave() {
    this.save(
      this.organizationService.update(this.user.primary_organization),
      `Your organization name has been updated.
       Your colleagues will see this change the next time they log in.`
    );
  }

  edit(edittedInput: EditableInputComponent) {
    this.inputs
      .filter(input => input !== edittedInput)
      .forEach(input => input.cancel());
  }

  private save(observable, success) {
    observable.subscribe(() => {
      this.toastr.success(success);
      this.inputs.forEach(input => {
        input.isEditing = false;
        input.lastSavedValue = input.value;
      });
    }, () => {
      this.toastr.error('Something went wrong, please try again.');
    });
  }
}
