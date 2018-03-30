import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CityProfileOption } from '../../shared/models/city-profile.model';

@Component({
  selector: 'app-checkbox-group',
  templateUrl: './checkbox-group.component.html'
})
export class CheckboxGroupComponent implements OnInit {

  @Input() id: string;

  @Input() selected: {[key: string]: boolean};
  @Output() selectedChange = new EventEmitter<{[key: string]: boolean}>();

  @Input() options: CityProfileOption[];

  constructor() { }

  ngOnInit() {
  }

  isSelected(opt: CityProfileOption) {
    return this.selected[opt.name];
  }

  public toggleOption(opt: CityProfileOption) {
    this.selected[opt.name] = !this.selected[opt.name];
    this.selectedChange.emit(this.selected);
  }

}
