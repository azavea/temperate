import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { GmapAutocompleteDirective, Location } from '..';

type PlaceResult = google.maps.places.PlaceResult;

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
export class OrgLocationGeocoderComponent implements ControlValueAccessor {

  public address: PlaceResult = null;
  public input = '';

  private onChange = (_: any) => { };

  public writeValue(location: any) {
    this.input = `${location.name}, ${location.admin}`;
  }

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any) {}

  public itemSelected(address: PlaceResult) {
    if (address.geometry) {
      this.address = address;
      this.input = address.formatted_address;
      this.onChange(this.getLocation());
    } else {
      this.address = null;
    }
  }

  public itemBlurred() {
    // Clicking on a suggested option blurs the input, and before `itemSelected` has a chance
    // to update the value, this will find a mis-match and set an error state. Using a timeout
    // means `itemSelected` will run first and all will be in order by the time this fires.
    setTimeout(() => {
      const savedName = this.address ? this.address.formatted_address : null;
      const formName = this.input;
      if (formName && savedName !== formName) {
        this.address = null;
        this.input = '';
        this.onChange(null);
      }
    }, 100);
  }

  private getAdminFromAddress(address: PlaceResult): string {
    let admin = '';
    address.address_components.forEach(component => {
      if (component.types.includes('administrative_area_level_1')) {
        admin = component.short_name;
      }
    });
    return admin;
  }

  private getLocation() {
    return new Location({
      name: this.address.name,
      admin: this.getAdminFromAddress(this.address),
      point: {
        type: 'Point',
        coordinates: [
          this.address.geometry.location.lng(),
          this.address.geometry.location.lat(),
        ]
      }
    });
  }
}
