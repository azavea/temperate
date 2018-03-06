import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Rx';

import { City as ApiCity } from 'climate-change-components';
import { CityService } from '../../../core/services/city.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { City, Organization } from '../../../shared';
import { OrganizationStepKey } from '../../organization-step-key.enum';
import { OrganizationWizardStepComponent } from '../../organization-wizard-step.component';

interface CityStepFormModel {
  location: ApiCity;
  name: string;
}

@Component({
  selector: 'app-organization-city-step',
  templateUrl: './city-step.component.html'
})
export class CityStepComponent extends OrganizationWizardStepComponent<CityStepFormModel>
                               implements OnInit {

  public key: OrganizationStepKey = OrganizationStepKey.City;

  public cities: Observable<ApiCity[]>;
  public city: ApiCity = null;
  public noResults = false;

  @Input() form: FormGroup;

  constructor(protected session: WizardSessionService<Organization>,
              protected organizationService: OrganizationService,
              protected toastr: ToastrService,
              private cityService: CityService) {
    super(session, organizationService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    const organization = this.session.getData() || new Organization({});

    this.cities = Observable.create((observer) => {
      this.cityService
        .search(this.form.controls.location.value)
        .map(results => {
          results.forEach(result => {
            const displayName = this.getDisplayName(result);
            result.properties['displayName'] = displayName;
          });

          return results;
        })
        .subscribe(res => observer.next(res));
    });
  }

  fromModel(organization: Organization): CityStepFormModel {
    let loc = null;

    if (organization.location && organization.location.properties) {
      loc = {
        id: organization.location.properties.api_city_id,
        properties: {
          name: organization.location.properties.name
        }
      } as ApiCity;
    }
    return {
      location: loc,
      name: organization.name
    };
  }

  getFormModel(): CityStepFormModel {
    const data: CityStepFormModel = {
      location: this.city,
      name: this.form.controls.name.value
    };
    return data;
  }

  toModel(data: CityStepFormModel, organization: Organization) {
    if (!!data.location) {
      organization.location = {
        properties: {
          api_city_id: data.location.id
        }
      } as City;
    } else {
      organization.location = null;
    }
    organization.name = data.name;
    return organization;
  }

  itemSelected(event: TypeaheadMatch) {
    const savedName = this.city ? this.getDisplayName(this.city) : null;
    const formName = this.form.controls.location.value;

    if (savedName !== formName) {
      this.city = event.item ? event.item : null;
      this.noResults = false;
    }
  }

  itemBlurred() {
    const savedName = this.city ? this.getDisplayName(this.city) : null;
    const formName = this.form.controls.location.value;

    if (savedName !== formName) {
      this.form.controls.location.setValue('');
      this.city = null;
      this.noResults = false;
    }
  }

  onNoResults() {
    this.noResults = true;
  }

  onKey(e) {
    if (e.target.value === '') {
      this.noResults = false;
    }
  }

  getDisplayName(city: ApiCity): string {
    return `${city.properties.name}, ${city.properties.admin}`;
  }
}
