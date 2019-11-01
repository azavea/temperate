import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { APICacheService } from '../../climate-api';
import { CommunitySystem, WeatherEvent } from '../../shared';
import {
  Impact,
  ImpactCommunitySystemRank,
  ImpactWeatherEventRank,
} from '../../shared/models/impact.model';
import { CORE_IMPACTSERVICE_LIST } from '../constants/cache';

@Injectable()
export class ImpactService {

  constructor(private http: HttpClient,
              private cache: APICacheService) {}

  list(): Observable<Impact[]> {
    const url = `${environment.apiUrl}/api/impacts/`;
    const request = this.http.get<Impact[]>(url);
    return this.cache.get(CORE_IMPACTSERVICE_LIST, request);
  }

  rankedFor(weatherEvent: WeatherEvent, communitySystem?: CommunitySystem): Observable<Impact[]> {
    return this.list().pipe(map(i => this.rankImpacts(i, weatherEvent, communitySystem)));
  }

  rankImpacts(impacts: Impact[], weatherEvent: WeatherEvent,
              communitySystem?: CommunitySystem): Impact[] {
    let rankedImpacts = impacts.filter(impact => {
      return this.getWeatherEventRank(impact, weatherEvent) !== undefined;
    });

    if (communitySystem) {
      rankedImpacts = rankedImpacts.concat(impacts.filter(impact => {
        return this.getCommunitySystemRank(impact, communitySystem) !== undefined;
      }));
    }

    rankedImpacts.sort((a, b) => {
      const weatherEventRankA = this.getWeatherEventRank(a, weatherEvent);
      const weatherEventRankB = this.getWeatherEventRank(b, weatherEvent);
      // Without CS we're guaranteed to have ranks for weather events
      if (!communitySystem) {
        return weatherEventRankA.order - weatherEventRankB.order;
      }

      const communitySystemA = this.getCommunitySystemRank(a, communitySystem);
      const communitySystemB = this.getCommunitySystemRank(b, communitySystem);

      // Impacts that match both WE & CS are sorted first
      if ((weatherEventRankA && communitySystemA) && !(weatherEventRankB && communitySystemB)) {
        return -1;
      }
      if (!(weatherEventRankA && communitySystemA) && (weatherEventRankB && communitySystemB)) {
        return 1;
      }

      // If we have both weather events & hazards for each, prefer
      // weather event ordering over community system
      if (weatherEventRankA && weatherEventRankB && communitySystemA && communitySystemB) {
        if (weatherEventRankA.order !== weatherEventRankB.order) {
          return weatherEventRankA.order - weatherEventRankB.order;
        }
        return communitySystemA.order - communitySystemB.order;
      }

      // If both sides are missing either WS or CS, use order to sort
      // but sort weather event related impacts first if tied
      if (weatherEventRankA && !weatherEventRankB) {
        if (weatherEventRankA.order !== communitySystemB.order) {
          return weatherEventRankA.order - communitySystemB.order;
        }
        return -1;
      }
      if (!weatherEventRankA && weatherEventRankB) {
        if (communitySystemA.order !== weatherEventRankB.order) {
          return communitySystemA.order - weatherEventRankB.order;
        }
        return 1;
      }

      // Shouldn't be possible to reach this stage
      console.warn('Logic error in ImpactService.rankImpacts');
      return 0;
    });
    return rankedImpacts;
  }

  private getCommunitySystemRank(
    impact: Impact, communitySystem: CommunitySystem): ImpactCommunitySystemRank {
    return impact.community_system_ranks.find(r => r.community_system === communitySystem.id);
  }

  private getWeatherEventRank(impact: Impact, weatherEvent: WeatherEvent): ImpactWeatherEventRank {
    return impact.weather_event_ranks.find(r => r.weather_event === weatherEvent.id);
  }
}
