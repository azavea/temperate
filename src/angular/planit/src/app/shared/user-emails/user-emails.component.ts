import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-user-emails',
  templateUrl: './user-emails.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserEmailsComponent),
      multi: true,
    }
  ]
})
export class UserEmailsComponent implements ControlValueAccessor {

  @Input() public inputId: string = null;
  @Input() public tabindex = 1;
  @Input() public errors: { [key: string]: string} = {};

  @Output() added = new EventEmitter<string>();

  public email = '';
  public emails: Set<string> = new Set();

  private onChange = (_: any) => { };

  public writeValue(emails: any) {
    if (!emails) {
      this.emails = new Set();
    } else if (Array.isArray(emails)) {
      this.emails = new Set(emails);
    } else if (emails instanceof Set) {
      this.emails = emails;
    }
  }

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any) {}

  add() {
    this.added.emit(this.email);
    this.emails.add(this.email);
    this.email = '';
    this.onChange(Array.from(this.emails));
  }

  remove(email) {
    this.emails.delete(email);
    this.onChange(Array.from(this.emails));
  }

  hasError(email) {
    return email in this.errors;
  }
}
