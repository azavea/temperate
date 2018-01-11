import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

export interface OptionDropdownOption {
  label: string;
  description?: string;
}

@Component({
  selector: 'app-option-dropdown',
  templateUrl: './option-dropdown.component.html'
})
export class OptionDropdownComponent implements OnInit {

  @Input() control: FormControl;
  @Input() options: Map<string, OptionDropdownOption>;

  public optionsKeys: string[];

  constructor() { }

  ngOnInit() {
    this.optionsKeys = Array.from(this.options.keys());
  }

  setOption(opt: any) {
    this.control.setValue(opt);
    this.control.markAsDirty();
  }
}
