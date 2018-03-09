import * as some from 'lodash.some';

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
  @Input() public inputId: string = null;

  public selected = '';
  public availableOptions: Set<string> = new Set();
  public selectedOptions: Set<string> = new Set();
  public isDisabled = false;

  private onChange = (_: any) => { };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.options = changes['options'].currentValue.sort();
      this.availableOptions = this.getAvailableOptions();
    }
  }

  // From the add button, get the value from the model.
  public onAdd() {
    const selected = this.selected.trim();
    this.add(selected);
  }

  // From the enter key, also get the value from the model, but wait a moment in case this
  // "enter" press triggered a selection, since we then want the onSelect to take precedence
  // and clear the input.
  public onEnter() {
    setTimeout(() => {
      this.onAdd(); }
    , 100);
  }

  // From a typeahead selection, use the event value
  public onSelect(event: TypeaheadMatch) {
    this.add(event.item);
  }

  // Shared logic to store a value, remove it from available options, and clear the input.
  private add(selected: string) {
    if (!selected) {
      return;
    }

    this.selectedOptions.add(selected);
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
    if (!selectedOptions) {
      this.selectedOptions = new Set();
    } else if (Array.isArray(selectedOptions)) {
      this.selectedOptions = new Set(selectedOptions);
    } else if (selectedOptions instanceof Set) {
      this.selectedOptions = selectedOptions;
    }
  }

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any) {}

  public setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }

  private getAvailableOptions() {
    return new Set(this.options.filter(option => !this.selectedOptions.has(option)));
  }
}
