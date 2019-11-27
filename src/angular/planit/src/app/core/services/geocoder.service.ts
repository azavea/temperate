import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { APICacheService } from '../../climate-api';
import { LOCA_EXTENT } from '../constants/map';


import { GeocoderResponse, SuggestResponse, Suggestion } from '../../shared/';


interface EsriApiToken {
  esri_token: string;
}


@Injectable()
export class GeocoderService {

  private ESRI_CLIENT_TOKEN_KEY = 'esri.token';
  private MAX_AGE = 1000 * 60 * 60 * 2;  // 2 hours in ms

  constructor(protected http: HttpClient,
              private cache: APICacheService) {}

  suggest(input: string): Observable<SuggestResponse> {
    // Subregion seems to be equivalent to county
    const categories = ['City', 'Subregion'].join(',');
    const extent = LOCA_EXTENT.join(',');

    // tslint:disable-next-line:max-line-length
    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${input}&f=pjson&category=${categories}&searchExtent=${extent}&countryCode=USA`;

    return this.http.get<SuggestResponse>(url);
  }

  find(suggestion: Suggestion): Observable<GeocoderResponse> {
    return this.getToken().pipe(
      mergeMap(token => {
        // tslint:disable-next-line:max-line-length
        const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?magicKey=${suggestion.magicKey}&f=pjson&outFields=PlaceName,RegionAbbr&forStorage=true&token=${token}&countryCode=USA`;
        return this.http.get<GeocoderResponse>(url);
      })
    );
  }

  private getToken(): Observable<string> {
    const req = this.http.get<EsriApiToken>(`${environment.apiUrl}/esri-api-token/`)
      .pipe(map(response => response.esri_token));
    return this.cache.get(this.ESRI_CLIENT_TOKEN_KEY, req, this.MAX_AGE);
  }
}
