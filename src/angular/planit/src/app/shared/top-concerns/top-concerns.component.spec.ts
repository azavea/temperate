import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Rx';

import { WeatherEventService } from '../../core/services/weather-event.service';
import { TopConcernsComponent } from './top-concerns.component';

describe('TopConcernsComponent', () => {
  let component: TopConcernsComponent;

  const mockEvents = [
    {name: 'Hurricanes', concern: null},
    {name: 'Heat Waves', concern: {value: 9.6, units: 'count'}},
  ];

  let mockWeatherEventService;

  beforeEach(() => {
    mockWeatherEventService = {
      rankedEvents: jasmine.createSpy('rankedEvents').and.returnValue(
        Observable.of({json: () => mockEvents}))
    };
    component = new TopConcernsComponent(mockWeatherEventService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
