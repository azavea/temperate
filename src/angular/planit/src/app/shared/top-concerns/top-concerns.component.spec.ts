import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopConcernsComponent } from './top-concerns.component';

describe('TopConcernsComponent', () => {
  let component: TopConcernsComponent;
  let fixture: ComponentFixture<TopConcernsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopConcernsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopConcernsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
