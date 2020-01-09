import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

import { OrganizationService } from '../../../core/services/organization.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { Location, Organization } from '../../../shared';
import { OrganizationStepKey } from '../../organization-step-key.enum';
import { OrganizationWizardStepComponent } from '../../organization-wizard-step.component';

interface CityStepFormModel {
  location: Location;
  name: string;
}

@Component({
  selector: 'app-organization-city-step',
  templateUrl: './city-step.component.html'
})
export class CityStepComponent extends OrganizationWizardStepComponent<CityStepFormModel>
                               implements OnInit {

  public key: OrganizationStepKey = OrganizationStepKey.City;

  @Input() form: FormGroup;

  constructor(protected session: WizardSessionService<Organization>,
              protected organizationService: OrganizationService,
              protected toastr: ToastrService) {
    super(session, organizationService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    const organization = this.session.getData() || new Organization({});
  }

  fromModel(organization: Organization): CityStepFormModel {
    return {
      location: organization.location,
      name: organization.name
    };
  }

  getFormModel(): CityStepFormModel {
    const data: CityStepFormModel = {
      location: this.form.controls.location.value,
      name: this.form.controls.name.value
    };
    return data;
  }

  toModel(data: CityStepFormModel, organization: Organization) {
    if (!!data.location) {
      organization.location = data.location;
    } else {
      organization.location = null;
    }
    organization.name = data.name;
    return organization;
  }
}
