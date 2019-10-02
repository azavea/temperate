import { Component, Input } from '@angular/core';

import { Observable } from 'rxjs';

import { Organization } from '../../shared/';

@Component({
  selector: 'app-city-minimap',
  templateUrl: 'city-minimap.component.html'
})

export class CityMinimapComponent {

  @Input() public organization: Organization;

  constructor() { }
}
