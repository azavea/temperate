import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Router } from '@angular/router';

import { BsModalService, ModalModule } from 'ngx-bootstrap';

import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from './navbar.component';

class RouterStub {
  url: string;
}

class AuthServiceStub {
  isAuthenticated() {
    return true;
  }
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarComponent ],
      providers: [
        BsModalService,
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: Router, useClass: RouterStub }
      ],
      imports: [ ModalModule.forRoot() ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
