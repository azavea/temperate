import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { TypeaheadMatch } from 'ngx-bootstrap';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GeocoderResponse, Location, Suggestion } from '..';
import { GeocoderService } from '../../core/services/geocoder.service';

@Component({
  selector: 'app-org-location-geocoder',
  templateUrl: './org-location-geocoder.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrgLocationGeocoderComponent),
      multi: true,
    }
  ]
})
export class OrgLocationGeocoderComponent implements ControlValueAccessor, OnInit {

  public suggestion: Suggestion = null;
  public input = '';
  public geocoder: Observable<Suggestion[]>;

  constructor(private geocoderService: GeocoderService) { }

  ngOnInit() {
    this.geocoder = Observable.create((observer) => {
      this.geocoderService
        .suggest(this.input)
        .pipe(map(results => results.suggestions))
        .subscribe(res => observer.next(res));
    });
  }

  private onChange = (_: any) => { };

  public writeValue(location: any) {
    this.input = location ? location.getFullName() : '';
  }

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any) {}

  public itemSelected(match: TypeaheadMatch) {
    const suggestion = match.item as Suggestion;
    if (suggestion) {
      this.suggestion = suggestion;
      this.input = suggestion.text;
      this.geocoderService.find(suggestion).subscribe((result) => {
        this.onChange(this.getLocation(result));
      });
    } else {
      this.suggestion = null;
    }
  }

  public itemBlurred() {
    // Clicking on a suggested option blurs the input, and before `itemSelected` has a chance
    // to update the value, this will find a mis-match and set an error state. Using a timeout
    // means `itemSelected` will run first and all will be in order by the time this fires.
    setTimeout(() => {
      const savedName = this.suggestion ? this.suggestion.text : null;
      const formName = this.input;
      if (savedName !== formName) {
        this.suggestion = null;
        this.input = '';
        this.onChange(null);
      }
    }, 100);
  }

  public noResults(hasNoResults: boolean) {
    if (hasNoResults) {
      this.onChange(null);
    }
  }

  private getLocation(result: GeocoderResponse) {
    if (!result || !result.candidates || result.candidates.length === 0) {
      return null;
    }

    const candidate = result.candidates[0];
    return new Location({
      geometry: {
        type: 'Point',
        coordinates: [
          candidate.location.x,
          candidate.location.y,
        ]
      },
      properties: {
        name: candidate.attributes['PlaceName'],
        admin: candidate.attributes['RegionAbbr'],
      }
    });
  }
}
