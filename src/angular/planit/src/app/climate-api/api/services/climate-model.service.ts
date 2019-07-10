import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ClimateModel } from '../models/climate-model.model';
import { ClimateApiConfig } from '../config';
import { APICacheService } from './api-cache.service';

/*
 * Climate Model Service
 * Returns climate models from API
 */
@Injectable({providedIn: 'root'})
export class ClimateModelService {

  constructor(private cache: APICacheService,
              private config: ClimateApiConfig,
              private http: HttpClient) {}

  public list(): Observable<ClimateModel[]> {
    const url = this.config.apiHost + '/api/climate-model/';
    const request = this.http.get(url);
    return this.cache.get('climate.api.climatemodel.list', request);
  }
}
