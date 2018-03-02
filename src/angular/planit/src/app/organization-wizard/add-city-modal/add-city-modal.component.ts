import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { AddCityService } from '../../core/services/add-city.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-add-city-modal',
  templateUrl: './add-city-modal.component.html'
})
export class AddCityModalComponent implements OnInit {

  public url: string;
  public user: User;
  public modalRef: BsModalRef;
  public cityForm: FormGroup;
  public error: string[];

  constructor(private modalService: BsModalService,
              private addCityService: AddCityService,
              private authService: AuthService,
              private userService: UserService,
              public fb: FormBuilder) {
  }

  ngOnInit() {
    this.cityForm = this.fb.group({
      'city': ['', [Validators.required]],
      'state': ['', [Validators.required]],
      'subject': ['Add my city to Temperate please'],
      'description': ['']
    });
    if (this.authService.isAuthenticated()) {
      this.userService.current().subscribe(u => {
        this.user = u;
      });
    }
    this.url = document.location.origin + '/methodology';
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {animated: false});
  }

  public changeTemplate(template: TemplateRef<any>) {
    this.addCityService.sendAddCityEmail(this.cityForm, this.user).subscribe(
      response => {
        this.modalRef.hide();
        this.openModal(template);
      },
      error => {
        this.error = ["There was an error submitting your request. Check your form is correct and try again or email support@temperate.io directly."]
      }
    );
  }
}
