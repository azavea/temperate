import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ClimateApiConfig } from '../config';
import { HistoricRange } from '../models/historic-range.model';
import { APICacheService } from './api-cache.service';

/*
 * Historic Range Service
 * Returns available historic ranges from API
 */
@Injectable({providedIn: 'root'})
export class HistoricRangeService {

  constructor(private cache: APICacheService,
              private config: ClimateApiConfig,
              private http: HttpClient) {}

  public list(): Observable<HistoricRange[]> {
    const url = this.config.apiHost + '/api/historic-range/';
    const request = this.http.get(url);
    return this.cache.get('climate.api.historicrange.list', request);
  }
}
