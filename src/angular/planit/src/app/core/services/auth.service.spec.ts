import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from './auth.service';
import { MarketingComponent } from '../../marketing/marketing.component';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
      imports: [ HttpModule, RouterTestingModule.withRoutes([
        { path: '*', component: MarketingComponent }
      ])],
      declarations: [ MarketingComponent ],
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should be unauthenticated by default', inject([AuthService], (service: AuthService) => {
    expect(service.isAuthenticated()).toBeFalsy();
  }));
});
