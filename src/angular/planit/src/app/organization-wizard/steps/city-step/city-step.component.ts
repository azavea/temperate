import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Rx';

import { OrganizationService } from '../../../core/services/organization.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { GmapAutocompleteDirective, Location, Organization } from '../../../shared';
import { OrganizationStepKey } from '../../organization-step-key.enum';
import { OrganizationWizardStepComponent } from '../../organization-wizard-step.component';

type PlaceResult = google.maps.places.PlaceResult;

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

  public address: PlaceResult = null;
  public noResults = false;

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
      location: new Location({
        name: this.address.name,
        admin: this.getAdminFromAddress(this.address),
        point: {
          type: 'Point',
          coordinates: [
            this.address.geometry.location.lng(),
            this.address.geometry.location.lat(),
          ]
        }
      }),
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

  itemSelected(address: PlaceResult) {
    this.address = address;
    this.form.controls.location.setValue(address.formatted_address);
  }

  itemBlurred() {
    // Clicking on a suggested option blurs the input, and before `itemSelected` has a chance
    // to update the value, this will find a mis-match and set an error state. Using a timeout
    // means `itemSelected` will run first and all will be in order by the time this fires.
    setTimeout(() => {
      const savedName = this.address ? this.address.formatted_address : null;
      const formName = this.form.controls.location.value;
      if (formName && savedName !== formName) {
        this.address = null;
        this.form.controls.location.setErrors({city: true});
      }
    }, 100);
  }

  getAdminFromAddress(address: PlaceResult): string {
    let admin = '';
    address.address_components.forEach(component => {
      if (component.types.includes('administrative_area_level_1')) {
        admin = component.short_name;
      }
    });
    return admin;
  }
}
