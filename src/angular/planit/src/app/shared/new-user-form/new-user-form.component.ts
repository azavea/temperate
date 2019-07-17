import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AccountCreateService } from '../../core/services/account-create.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-new-user-form',
  templateUrl: './new-user-form.component.html'
})
export class NewUserFormComponent implements OnInit {

  public model: User = new User({});
  public submitted = false;
  public activated = false;
  public acceptedTOS = false;
  public errors: any[] = [];
  public emailDisabled = false;
  public passwordVisible = false;

  private activationKey: string;

  constructor(private accountCreateService: AccountCreateService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(paramsAsMap => {
      if (paramsAsMap['params']['email']) {
        this.model.email = paramsAsMap['params']['email'];
        this.emailDisabled = true;
      }
      if (paramsAsMap['params']['key']) {
        this.activationKey = paramsAsMap['params']['key'];
      }
    });
  }

  onSubmit() {
    this.createUser().subscribe((newUser: User) => {
      this.submitted = true;
      this.activated = !!newUser.primary_organization;
      this.model = newUser;
    }, error => {
      this.errors = error.error;
    });
  }

  private createUser() {
    if (this.activationKey) {
      return this.accountCreateService.create(this.model, this.activationKey);
    } else {
      return this.accountCreateService.create(this.model);
    }
  }
}
