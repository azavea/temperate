import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html'
})
export class LoginFormComponent {

  public username = '';

  public password = '';

  public errors: any = {};

  public emailSent = false;

  @Output() closed: EventEmitter<string> = new EventEmitter();

  constructor(private authService: AuthService, private router: Router) {
  }

  submit() {
    this.authService.login(this.username, this.password).subscribe(
      response => {
        this.closeModal();
        this.router.navigateByUrl('/dashboard');
      },
      error => {
        this.errors = error.json();
      }
    );
  }

  forgotPassword() {
    this.authService.resetPasswordSendEmail(this.username).subscribe(
      response => {
        this.emailSent = true;
        this.errors = {};
      },
      error => {
        this.errors = error.json().errors;
      }
    );
  }

  closeModal() {
    this.closed.emit('closed');
  }
}
