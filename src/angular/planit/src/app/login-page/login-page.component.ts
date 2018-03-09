import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent implements OnInit {

  public activated = false;
  public activationFailed = false;
  public alreadyActivated = false;
  public reset = false;
  public resetExpired = false;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router) {}

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(paramsAsMap => {
      if (paramsAsMap['params']['activated']) {
        this.activated = true;
      }
      if (paramsAsMap['params']['activationFailed']) {
        this.activationFailed = true;
      }
      if (paramsAsMap['params']['alreadyActivated']) {
        this.alreadyActivated = true;
      }
      if (paramsAsMap['params']['reset']) {
        this.reset = true;
      }
      if (paramsAsMap['params']['resetExpired']) {
        this.resetExpired = true;
      }
    });
  }

}
