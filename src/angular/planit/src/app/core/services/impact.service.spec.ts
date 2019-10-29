import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, inject } from '@angular/core/testing';

import { APICacheService } from '../../climate-api';
import { CommunitySystem, Impact, WeatherEvent } from '../../shared';
import { ImpactService } from './impact.service';

describe('ImpactService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [APICacheService, ImpactService],
      imports: [ HttpClientTestingModule],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
  });

  it('should be created', inject([ImpactService], (service: ImpactService) => {
    expect(service).toBeTruthy();
  }));

  it('should match either weather event or community system',
     inject([ImpactService], (service: ImpactService) => {
    const impacts: Impact[] = [{
      label: 'a',
      community_system_ranks: [{ community_system: 1, order: 1 }],
      weather_event_ranks: []
    }, {
      label: 'b',
      community_system_ranks: [],
      weather_event_ranks: [{ weather_event: 1, order: 1 }]
    }, {
      label: 'c',
      community_system_ranks: [{ community_system: 2, order: 2 }],
      weather_event_ranks: [{ weather_event: 2, order: 2 }]
    }];
    const weatherEvent = { id: 1 } as WeatherEvent;
    const communitySystem = { id: 1 } as CommunitySystem;

    const rankedImpacts = service.rankImpacts(impacts, weatherEvent, communitySystem);
    expect(rankedImpacts.length).toBe(2);
  }));

  it('should filter out non-matches', inject([ImpactService], (service: ImpactService) => {
    const impacts: Impact[] = [{
      label: 'a',
      community_system_ranks: [{ community_system: 1, order: 1 }],
      weather_event_ranks: []
    }, {
      label: 'b',
      community_system_ranks: [],
      weather_event_ranks: [{ weather_event: 1, order: 1 }]
    }, {
      label: 'c',
      community_system_ranks: [{ community_system: 2, order: 2 }],
      weather_event_ranks: [{ weather_event: 2, order: 2 }]
    }];
    const weatherEvent = { id: 1 } as WeatherEvent;

    const rankedImpacts = service.rankImpacts(impacts, weatherEvent);
    expect(rankedImpacts.length).toBe(1);
    expect(rankedImpacts[0].label).toBe('b');
  }));

  it('should rank both matches first', inject([ImpactService], (service: ImpactService) => {
    const impacts: Impact[] = [{
      label: 'community system only',
      community_system_ranks: [{ community_system: 1, order: 1 }],
      weather_event_ranks: []
    }, {
      label: 'weather event only',
      community_system_ranks: [],
      weather_event_ranks: [{ weather_event: 1, order: 1 }]
    }, {
      label: 'both',
      community_system_ranks: [{ community_system: 1, order: 2 }],
      weather_event_ranks: [{ weather_event: 1, order: 2 }]
    }];
    const weatherEvent = { id: 1 } as WeatherEvent;
    const communitySystem = { id: 1 } as CommunitySystem;

    const rankedImpacts = service.rankImpacts(impacts, weatherEvent, communitySystem);
    expect(rankedImpacts[0].label).toBe('both');
  }));

  it('should use order to rank', inject([ImpactService], (service: ImpactService) => {
    const impacts: Impact[] = [{
      label: 'a',
      community_system_ranks: [{ community_system: 1, order: 2 }],
      weather_event_ranks: []
    }, {
      label: 'b',
      community_system_ranks: [],
      weather_event_ranks: [{ weather_event: 1, order: 1 }]
    }];
    const weatherEvent = { id: 1 } as WeatherEvent;
    const communitySystem = { id: 1 } as CommunitySystem;

    const rankedImpacts = service.rankImpacts(impacts, weatherEvent, communitySystem);
    expect(rankedImpacts[0].label).toBe('b');
  }));

  it('should rank tie-break weather event first',
     inject([ImpactService], (service: ImpactService) => {
    const impacts: Impact[] = [{
      label: 'community system only',
      community_system_ranks: [{ community_system: 1, order: 1 }],
      weather_event_ranks: []
    }, {
      label: 'weather event only',
      community_system_ranks: [],
      weather_event_ranks: [{ weather_event: 1, order: 1 }]
    }];
    const weatherEvent = { id: 1 } as WeatherEvent;
    const communitySystem = { id: 1 } as CommunitySystem;

    const rankedImpacts = service.rankImpacts(impacts, weatherEvent, communitySystem);
    expect(rankedImpacts[0].label).toBe('weather event only');
  }));
});
