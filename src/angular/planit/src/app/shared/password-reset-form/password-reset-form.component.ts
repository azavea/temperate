import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-password-reset-form',
  templateUrl: './password-reset-form.component.html'
})
export class PasswordResetFormComponent {

  public password1 = '';
  public password2 = '';

  public errors: any = {};

  @Output() closed: EventEmitter<string> = new EventEmitter();

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) {}

  submit() {
    const token: string = this.route.snapshot.paramMap.get('token');
    this.authService.resetPassword(token, this.password1, this.password2).subscribe(
      (data) => {
        this.closeModal();
      },
      (errors) => {
        this.errors = errors.json().errors;
      }
    );
  }

  closeModal() {
    this.router.navigate(['/']);
    this.closed.emit('closed');
  }
}
