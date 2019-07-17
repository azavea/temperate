import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { ClimateApiConfig } from '../config';
import { Scenario } from '../models/scenario.model';
import { APICacheService } from './api-cache.service';

/*
 * Scenario Service
 * Returns scenarios from API
 */
@Injectable({providedIn: 'root'})
export class ScenarioService {

  constructor(private cache: APICacheService,
              private config: ClimateApiConfig,
              private http: HttpClient) {}

  public list(): Observable<Scenario[]> {
    const url = this.config.apiHost + '/api/scenario/';
    const request = this.http.get(url);
    return this.cache.get('climate.api.scenario.list', request);
  }
}
