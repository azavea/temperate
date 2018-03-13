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
  public unsaved = '';
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
    // onEnter and onAdd are saving the raw string as typed, but since this is saving the selected
    // value, we need to get the raw 'unsaved' value out of the list. This doesn't risk clearing
    // a value that's supposed to stay, because `unsaved` gets cleared if the text in the
    // input is already among the selected options.
    this.selectedOptions.delete(this.unsaved);
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
    this.unsaved = '';
  }

  public remove(option: string) {
    this.selectedOptions.delete(option);
    this.availableOptions = this.getAvailableOptions();
    this.onChange(Array.from(this.selectedOptions));
  }

  /* Preserves values typed but not added by secretly saving them in the selected options list.
   * The template keeps the unsaved value from showing up in the list below the input, but
   * since they're added to the list and saved with the onChange callback, they don't disappear
   * if someone closes the wizard without saving them. Instead they become regular members of
   * the list.
   */
  public onUnsavedChange(event, source) {
    if (this.unsaved) {
      this.remove(this.unsaved);
    }

    const selected = this.selected.trim();
    if (this.selectedOptions.has(selected)) {
      // If the typed value is already in the list, neither add nor remove, and don't treat it
      // as unsaved.
      this.unsaved = '';
    } else if (selected) {
      this.unsaved = selected;
      // This doesn't use the `add` method because we
      // 1) don't want to clear `selected` and
      // 2) don't want to remove a value from the available options until it's explicitly
      // added, otherwise the suggestion would stop showing up when they haven't actually
      // selected it yet.
      this.selectedOptions.add(selected);
      this.onChange(Array.from(this.selectedOptions));
    }
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
