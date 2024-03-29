import { Component, EventEmitter, Input, Output } from '@angular/core';

/*  Units Dropdown Component

    -- Requires handling unit selection
    Expected use:
        <app-units-dropdown
            [units]="available_units"
            [unit]="your_unit"
            (unitSelected)="onUnitSelected($event)">
*/

@Component({
  selector: 'app-units-dropdown',
  templateUrl: './units-dropdown.component.html'
})
export class UnitsDropdownComponent {

  @Input() units: [string];
  @Input() unit: string;
  @Output() unitSelected = new EventEmitter<string>();

  public onUnitSelected(unit: string) {
    this.unitSelected.emit(unit);
  }
}
