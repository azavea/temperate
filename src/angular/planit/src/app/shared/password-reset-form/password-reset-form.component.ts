import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-password-reset-form',
  templateUrl: './password-reset-form.component.html'
})
export class PasswordResetFormComponent implements OnInit {

  public user: User;
  public new_password1 = '';
  public passwordVisible = false;
  public errors: any = {};

  private uid: string;
  private token: string;

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.uid = this.route.snapshot.paramMap.get('uid');
    this.token = this.route.snapshot.paramMap.get('token');
    this.authService.getUserFromUidToken(this.uid, this.token).subscribe(
      (data) => {
        this.user = data;
      },
      (errors) => {
        this.router.navigate(['/']);
      }
    );
  }

  submit() {
    // In order to make the form single input, we trick Django Registration library's serializer
    // by sending the one input twice rather than overriding the serializer to accept one input
    this.authService.resetPassword(this.uid, this.token, this.new_password1, this.new_password1)
      .subscribe(
      (data) => {
        this.router.navigate(['/login'], {queryParams: {reset: true}});
      },
      (errors) => {
        this.errors = errors.json();
      }
    );
  }
}
