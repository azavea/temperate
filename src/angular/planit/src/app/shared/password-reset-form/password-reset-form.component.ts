import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-password-reset-form',
  templateUrl: './password-reset-form.component.html'
})
export class PasswordResetFormComponent {

  public new_password1 = '';
  public new_password2 = '';

  public errors: any = {};

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) {}

  submit() {
    const uid: string = this.route.snapshot.paramMap.get('uid');
    const token: string = this.route.snapshot.paramMap.get('token');
    this.authService.resetPassword(uid, token, this.new_password1, this.new_password2).subscribe(
      (data) => {
        this.router.navigate(['/login'], {queryParams: {reset: true}});
      },
      (errors) => {
        this.errors = errors.json();
      }
    );
  }
}
