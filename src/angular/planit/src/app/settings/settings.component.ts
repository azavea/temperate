import { tap } from 'rxjs/operators';

import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { onErrorResumeNext } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { InviteUserService } from '../core/services/invite-user.service';
import { OrganizationService } from '../core/services/organization.service';
import { RemoveUserService } from '../core/services/remove-user.service';
import { UserService } from '../core/services/user.service';
import { User } from '../shared';
import {
  ConfirmationModalComponent
} from '../shared/confirmation-modal/confirmation-modal.component';

import { EditableInputComponent } from './editable-input/editable-input.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {

  @ViewChildren(EditableInputComponent) inputs: QueryList<EditableInputComponent>;
  @ViewChild('confirmRemoveModal', {static: true}) confirmDeleteModal: ConfirmationModalComponent;

  public form: FormGroup;
  public minDate: Date = new Date();
  public user: User;

  constructor(private fb: FormBuilder,
              private organizationService: OrganizationService,
              private toastr: ToastrService,
              private userService: UserService,
              private inviteUserService: InviteUserService,
              private removeUserService: RemoveUserService) {
    this.form = this.fb.group({
      'plan_due_date': [null, Validators.required],
      'users': []
    });
  }

  ngOnInit() {
    this.userService.current().subscribe(user => this.setUser(user));
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

  dueDateSave(date: Date) {
    if (!date) { return; }
    // User entered invalid date in input
    if (isNaN(date.getTime())) { return; }
    // Sometimes the datepicker fires the change method, but the date hasn't actually changed
    // Seems to happen mostly during control init
    if (date.getTime() === this.user.primary_organization.plan_due_date.getTime()) { return; }
    if (date.getTime() < this.minDate.getTime()) { return; }

    this.user.primary_organization.plan_due_date = date;
    this.organizationSave();
  }

  edit(edittedInput: EditableInputComponent) {
    this.inputs
      .filter(input => input !== edittedInput)
      .forEach(input => input.cancel());
  }

  inviteUser(email) {
    const message = 'Your new colleague will receive an email to join your organization';

    const observable = this.inviteUserService.invite(email)
      .pipe(tap((event) => {
        this.user.primary_organization.users.push(email);
        this.form.controls.users.setValue(this.user.primary_organization.users);
      }));
    this.save(observable, message);
  }

  removeUser(email) {
    const selfRemoval = this.user.email === email;
    const observable = this.confirmDeleteModal.confirm({
      title: selfRemoval ? 'Remove yourself' : 'Remove colleague',
      tagline: `
        Are you sure you want to remove <b>${selfRemoval ? 'yourself' : email}</b>
        from your organization? This cannot be undone.`,
      confirmText: 'Yes',
      cancelText: 'No, take me back',
    }).pipe(onErrorResumeNext, switchMap(() => {
      return this.removeUserService.remove(email);
    }), tap(a => {
      if (selfRemoval) {
        this.userService.invalidate();
        window.location.pathname = '/';
      } else {
        const users = this.user.primary_organization.users.filter(e => e !== email);
        this.user.primary_organization.users = users;
        this.form.controls.users.setValue(users);
      }
    }));
    this.save(observable, selfRemoval ? 'You have been removed' : 'Colleague removed');
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
      // If the save failed, reset the form controls
      this.toForm(this.user);
    });
  }

  private setUser(user: User) {
    this.user = user;
    this.toForm(user);
  }

  private toForm(user: User) {
    this.form.controls.plan_due_date.setValue(user.primary_organization.plan_due_date);
    this.form.controls.users.setValue(user.primary_organization.users);
  }
}
