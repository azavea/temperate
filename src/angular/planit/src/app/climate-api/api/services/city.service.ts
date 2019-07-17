import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ClimateApiConfig } from '../config';
import { City } from '../models/city.model';

/*
 * City Service
 * Returns cities from API
 */
@Injectable({providedIn: 'root'})
export class CityService {

  constructor(private http: HttpClient, private config: ClimateApiConfig) {}

  public list(page?: number, pageSize?: number): Observable<City[]> {
    const url = this.config.apiHost + '/api/city/';

    const searchParams: HttpParams = new HttpParams();
    if (page) {
      searchParams.append('page', page.toString());
    }
    if (pageSize) {
      searchParams.append('pageSize', pageSize.toString());
    }

    return this.http.get(url, { params: searchParams })
        .pipe(map(resp => resp['features'] || [] as City[]));
  }

  public search(text: string): Observable<City[]> {
    const url = this.config.apiHost + '/api/city/';
    const searchParams: HttpParams = new HttpParams();
    searchParams.append('search', text);
    return this.http.get(url, { params: searchParams })
        .pipe(map(response => response['features'] || [] as City[]));
  }

}
