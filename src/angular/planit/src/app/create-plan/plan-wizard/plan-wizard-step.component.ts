import { OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Rx';

import { OrganizationService } from '../../core/services/organization.service';
import { WizardSessionService } from '../../core/services/wizard-session.service';
import { Organization, WizardStepComponent } from '../../shared/';

export abstract class PlanWizardStepComponent<FormModel>
  extends WizardStepComponent<Organization, FormModel> implements OnInit {

  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected toastr: ToastrService) {
    super(session, toastr);
  }

  persistChanges(model: Organization): Observable<Organization> {
    console.log('persistChanges:');
    console.log(model);

    return !model.id ?
      this.orgService.create(model) :
      this.orgService.update(model);
  }
}
