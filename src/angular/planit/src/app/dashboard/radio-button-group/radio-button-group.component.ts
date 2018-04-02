import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CityProfileOption } from '../../shared/models/city-profile.model';

@Component({
  selector: 'app-radio-button-group',
  templateUrl: './radio-button-group.component.html'
})
export class RadioButtonGroupComponent implements OnInit {

  @Input() id: string;

  @Input() option: string;
  @Output() optionChange = new EventEmitter<string>();

  @Input() options: CityProfileOption[];

  constructor() { }

  ngOnInit() {
  }

  public setOption(opt: CityProfileOption) {
    this.option = opt.name;
    this.optionChange.emit(this.option);
  }
}
