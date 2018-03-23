import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-password-validator-popover',
  templateUrl: './password-validator-popover.component.html'
})
export class PasswordValidatorPopoverComponent implements OnInit {
  @Input() control: AbstractControl;

  constructor() { }

  ngOnInit() {
  }

  public valid(key: string) {
    return !!this.control.value && (this.control.valid || !(key in this.control.errors));
  }

}
