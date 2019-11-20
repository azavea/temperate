import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { APICacheService } from '../../climate-api';
import { LOCA_EXTENT } from '../constants/map';


import { GeocoderResponse, SuggestResponse, Suggestion } from '../../shared/';

@Injectable()
export class GeocoderService {

  private ESRI_CLIENT_TOKEN_KEY = 'esri.token';
  private MAX_AGE = 60 * 60 * 2;  // 2 hours

  constructor(protected http: HttpClient,
              private cache: APICacheService) {}

  suggest(input: string): Observable<SuggestResponse> {
    // Subregion seems to be equivalent to county
    const categories = ['City', 'Subregion'].join(',');
    const extent = LOCA_EXTENT.join(',');
    // tslint:disable-next-line:max-line-length
    const url = `http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${input}&f=pjson&category=${categories}&searchExtent=${extent}&countryCode=USA`;

    return this.http.get<SuggestResponse>(url);
  }

  find(suggestion: Suggestion): Observable<GeocoderResponse> {
    // tslint:disable-next-line:max-line-length
        const url = `http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?magicKey=${suggestion.magicKey}&f=pjson&outFields=PlaceName,RegionAbbr&countryCode=USA`;
    return this.http.get<GeocoderResponse>(url);
  }
}
