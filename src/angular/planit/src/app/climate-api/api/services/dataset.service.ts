import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ClimateApiConfig } from '../config';
import { Dataset } from '../models/dataset.model';
import { APICacheService } from './api-cache.service';

/*
 * Dataset Service
 * Returns datasets from API
 */
@Injectable({providedIn: 'root'})
export class DatasetService {

  constructor(private cache: APICacheService,
              private config: ClimateApiConfig,
              private http: HttpClient) {}

  public list(): Observable<Dataset[]> {
    const url = this.config.apiHost + '/api/dataset/';
    const request = this.http.get(url);
    return this.cache.get('climate.api.dataset.list', request);
  }
}