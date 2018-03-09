import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html'
})
export class ForgotPasswordPageComponent implements OnInit {

  public username = '';
  public emailSent = false;
  public errors: any = {};

  constructor(private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(paramsAsMap => {
      if (paramsAsMap['params']['username']) {
        this.username = paramsAsMap['params']['username'];
      }
    });
  }

  forgotPassword() {
    this.authService.resetPasswordSendEmail(this.username).subscribe(
      response => {
        this.emailSent = true;
        this.errors = {};
      },
      error => {
        this.errors = error.json();
      }
    );
  }

}
