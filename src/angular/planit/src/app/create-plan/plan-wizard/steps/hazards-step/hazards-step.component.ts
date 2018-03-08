import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import {
  Organization,
  Risk,
  WeatherEvent
} from '../../../../shared/';

import { OrganizationService } from '../../../../core/services/organization.service';
import { WeatherEventService } from '../../../../core/services/weather-event.service';
import { WizardSessionService } from '../../../../core/services/wizard-session.service';
import { PlanStepKey } from '../../plan-step-key';
import { PlanWizardStepComponent } from '../../plan-wizard-step.component';

export interface HazardsFormModel {
  selectedEvents: WeatherEvent[];
}

@Component({
  selector: 'app-plan-step-hazards',
  templateUrl: 'hazards-step.component.html'
})
export class HazardsStepComponent extends PlanWizardStepComponent<HazardsFormModel>
                                  implements OnInit {

  public form: FormGroup;
  public key = PlanStepKey.Hazards;
  public navigationSymbol = '2';
  public organization: Organization;
  public title = 'Hazards';

  private weatherEvents: WeatherEvent[] = [];

  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected toastr: ToastrService,
              private weatherEventService: WeatherEventService,
              private fb: FormBuilder) {
    super(session, orgService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    this.organization = this.session.getData();
    this.weatherEventService.list().subscribe(events => {
      this.weatherEvents = events;
      const orgWeatherEvents = this.getOrganizationEvents(this.organization);
      this.form.controls.selectedEvents.setValue(orgWeatherEvents);
    });
    this.setupForm(this.fromModel(this.organization));
  }

  getFormModel(): HazardsFormModel {
    return {
      selectedEvents: this.form.controls.selectedEvents.value
    };
  }

  setupForm(data: HazardsFormModel) {
    this.form = this.fb.group({
      selectedEvents: [data.selectedEvents, []]
    });
  }

  fromModel(model: Organization): HazardsFormModel {
    return {
      selectedEvents: this.getOrganizationEvents(model)
   };
  }

  toModel(data: HazardsFormModel, model: Organization): Organization {
    model.weather_events = data.selectedEvents.map(e => e.id);
    return model;
  }

  isStepComplete(): boolean {
    return this.form.controls.selectedEvents.value.length > 0;
  }

  private getOrganizationEvents(organization) {
    return this.weatherEvents.filter(e => organization.weather_events.includes(e.id));
  }
}
