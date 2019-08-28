import { OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { OrganizationService } from '../../core/services/organization.service';
import { WeatherEventService } from '../../core/services/weather-event.service';
import { WizardSessionService } from '../../core/services/wizard-session.service';
import { Organization, WizardStepComponent } from '../../shared/';

export abstract class PlanWizardStepComponent<FormModel>
  extends WizardStepComponent<Organization, FormModel> implements OnInit {

  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected weatherEventService: WeatherEventService,
              protected toastr: ToastrService) {
    super(session, toastr);
  }

  persistChanges(model: Organization): Observable<Organization> {
    return this.orgService.update(model).pipe(tap(org => this.weatherEventService.invalidate()));
  }
}
