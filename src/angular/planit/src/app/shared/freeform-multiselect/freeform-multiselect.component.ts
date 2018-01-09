import { Component, Input, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'app-freeform-multiselect',
  templateUrl: './freeform-multiselect.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FreeformMultiselectComponent),
      multi: true,
    }
  ]
})
export class FreeformMultiselectComponent implements ControlValueAccessor, OnChanges {

  @Input() public options: string[] = [];

  public selected = '';
  public availableOptions: Set<string> = new Set();
  public selectedOptions: Set<string> = new Set();

  private onChange = (_: any) => { };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.options = changes['options'].currentValue;
      this.availableOptions = this.getAvailableOptions();
    }
  }

  public add() {
    this.selectedOptions.add(this.selected);
    this.availableOptions.delete(this.selected);
    this.onChange(Array.from(this.selectedOptions));
    this.selected = '';
  }

  public remove(option: string) {
    this.selectedOptions.delete(option);
    this.availableOptions = this.getAvailableOptions();
    this.onChange(Array.from(this.selectedOptions));
  }

  public writeValue(selectedOptions: any) {
    this.selectedOptions = selectedOptions || new Set();
  }

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any) {}

  private getAvailableOptions() {
    return new Set(this.options.filter(option => !this.selectedOptions.has(option)));
  }
}