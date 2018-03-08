import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Rx';

import { TopConcernsComponent } from './top-concerns.component';

describe('TopConcernsComponent', () => {
  let component: TopConcernsComponent;

  beforeEach(() => {
    component = new TopConcernsComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
