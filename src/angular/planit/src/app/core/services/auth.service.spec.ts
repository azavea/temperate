import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, inject } from '@angular/core/testing';
import { Headers, Http, RequestOptions } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { APICacheService } from '../../climate-api';
import { MarketingComponent } from '../../marketing/marketing.component';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, APICacheService],
      imports: [ Headers, Http, RequestOptions, RouterTestingModule.withRoutes([
        { path: '*', component: MarketingComponent }
      ])],
      declarations: [ MarketingComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should be unauthenticated by default', inject([AuthService], (service: AuthService) => {
    expect(service.isAuthenticated()).toBeFalsy();
  }));

  it('should have not token set by default', inject([AuthService], (service: AuthService) => {
    expect(service.getToken()).toBeFalsy();
  }));

  it('logout should clear the token', inject([AuthService], (service: AuthService) => {
    const token = 'SOMEAPIKEY';
    // `setToken` is a private method and cannot be accessed under test, so set directly
    window.localStorage.setItem('auth.token', token);
    expect(service.getToken()).toEqual(token);
    service.logout();
    expect(service.getToken()).toBeFalsy();
  }));
});
