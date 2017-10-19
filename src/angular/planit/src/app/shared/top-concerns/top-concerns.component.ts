import { Component } from '@angular/core';

import { Concern, TOP_CONCERNS } from '../models/concern.model';
import { Indicator } from '../models/indicator.enum';


@Component({
  selector: 'app-top-concerns',
  templateUrl: './top-concerns.component.html',
  styleUrls: ['./top-concerns.component.scss']
})
export class TopConcernsComponent {

  concerns = TOP_CONCERNS;

  concernClass(concern: Concern): string {
    return 'concern-' + Indicator[concern.indicator];
  }

  format(concern: Concern): string {
    if (concern.isRelative) {
      return Number(concern.value * 100).toFixed(0) + '%';
    } else {
      return Number(concern.value).toPrecision(2);
    }
  }

  hasUnits(concern: Concern): boolean {
    return concern.indicator !== Indicator.ExtremeEvents;
  }

  defaultUnit(concern: Concern): string {
    if (concern.indicator === Indicator.Precipitation) {
      return 'in';
    } else if (concern.indicator === Indicator.Heat) {
      return 'F';
    }
  }

  alternateUnit(concern: Concern): string {
    if (concern.indicator === Indicator.Precipitation) {
      return 'cm';
    } else if (concern.indicator === Indicator.Heat) {
      return 'C';
    }
  }

  selectUnit(concern: Concern, unitType: string): void {
    // TODO: Actually pick alternate units... (GH #120)
  }

}
