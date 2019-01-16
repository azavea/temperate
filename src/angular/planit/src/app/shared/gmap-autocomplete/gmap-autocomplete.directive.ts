import { Directive, ElementRef, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';

import { MapsAPILoader } from '@agm/core';

@Directive({
  selector: '[appGmapAutocomplete]',
  exportAs: 'appGmapAutocomplete'
})
export class GmapAutocompleteDirective implements OnInit {

  private autocomplete: google.maps.places.Autocomplete;
  @Input() options: google.maps.places.AutocompleteOptions;
  @Output() placeChanged = new EventEmitter<google.maps.places.PlaceResult>();

  constructor(private el: ElementRef, private mapsApiLoader: MapsAPILoader, private zone: NgZone) {}

  ngOnInit() {
    try {
      this.setupAutocomplete();
    } catch (error) {
      this.mapsApiLoader.load().then(() => this.setupAutocomplete());
    }
  }

  public getPlace() {
    return this.autocomplete.getPlace();
  }

  private setupAutocomplete() {
    const defaults = {
      types: ['(cities)']
    };
    const options = Object.assign({}, defaults, this.options);
    this.autocomplete = new google.maps.places.Autocomplete(this.el.nativeElement, options);
    this.autocomplete.addListener('place_changed', () => this.onPlaceChanged());

    const forceAutocompleteOff = () => {
      // Chrome ignores 'autocomplete="off"' but will turn off autocomplete for
      // invalid options. Google Places sets 'autocomplete="off"' regardless of
      // what was set on the <input> before, so we need to override that in JS
      this.el.nativeElement.autocomplete = 'forced-false';
      this.el.nativeElement.removeEventListener('focus', forceAutocompleteOff);
    };
    this.el.nativeElement.addEventListener('focus', forceAutocompleteOff);
  }

  private onPlaceChanged() {
    const place = this.getPlace();
    // This event is handled outside of the Angular change detection cycle
    //  so emit inside a zone.run handler to trigger a detection cycle
    this.zone.run(() => this.placeChanged.emit(place));
  }
}
