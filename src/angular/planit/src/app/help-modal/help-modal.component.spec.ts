import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalModule } from 'ngx-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';

import { HelpModalComponent } from './help-modal.component';

describe('HelpModalComponent', () => {
  let component: HelpModalComponent;
  let fixture: ComponentFixture<HelpModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpModalComponent ],
      providers: [ BsModalService ],
      imports: [ ModalModule.forRoot() ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
