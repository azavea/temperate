import { OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Rx';

import { OrganizationService } from '../core/services/organization.service';
import { WizardSessionService } from '../core/services/wizard-session.service';
import { Organization, WizardStepComponent } from '../shared/';

export abstract class OrganizationWizardStepComponent<FormModel>
  extends WizardStepComponent<Organization, FormModel> implements OnInit {

  public navigationSymbol = '';
  public title = '';

  constructor(protected session: WizardSessionService<Organization>,
              protected organizationService: OrganizationService,
              protected toastr: ToastrService) {
    super(session, toastr);
  }

  persistChanges(model: Organization): Observable<Organization> {
    return this.organizationService.create(model);
  }

  setupForm(data: any) {}

  store() {
    const data = this.getFormModel();
    this.session.setDataForKey(this.key, data);
  }
}
