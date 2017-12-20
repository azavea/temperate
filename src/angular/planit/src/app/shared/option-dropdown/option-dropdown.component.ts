import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-option-dropdown',
  templateUrl: './option-dropdown.component.html'
})

export class OptionDropdownComponent implements OnInit {

  @Input() control: FormControl;

  constructor() { }

  ngOnInit() { }
}
