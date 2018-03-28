import { Component, Input } from '@angular/core';

import { Organization } from '../../../shared';

@Component({
  selector: 'app-plan-summary',
  templateUrl: 'plan-summary.component.html'
})
export class PlanSummaryComponent {

  @Input() org: Organization;

}
