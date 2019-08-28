import {
  AfterViewChecked,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { MultiPolygon } from 'geojson';

import { MovingDirection } from 'ng2-archwizard';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { OrganizationService } from '../../../../core/services/organization.service';
import { WeatherEventService } from '../../../../core/services/weather-event.service';
import { WizardSessionService } from '../../../../core/services/wizard-session.service';
import { CommunitySystem, Location, Organization } from '../../../../shared/';

import { PlanStepKey } from '../../plan-step-key';
import { PlanWizardStepComponent } from '../../plan-wizard-step.component';

export interface AreaFormModel {
  location: Location,
  bounds?: MultiPolygon;
}

enum AreaTabs {
  EnterCity,
  DrawArea,
}

@Component({
  selector: 'app-plan-step-area',
  templateUrl: 'area-step.component.html'
})

export class AreaStepComponent
  extends PlanWizardStepComponent<AreaFormModel>
  implements OnInit {

  public form: FormGroup;
  public navigationSymbol = '1';
  public title = 'Geographic area';
  public areaTab = AreaTabs.EnterCity;
  public areaTabs = AreaTabs;

  private bounds?: MultiPolygon = null;

  @Output() wizardCompleted = new EventEmitter();

  public organization: Organization;
  public key: PlanStepKey = PlanStepKey.Area;

  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected weatherEventService: WeatherEventService,
              protected toastr: ToastrService,
              private fb: FormBuilder) {
    super(session, orgService, weatherEventService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    this.organization = this.session.getData();
    this.setupForm(this.fromModel(this.organization));
  }

  getFormModel(): AreaFormModel {
    return {
      location: this.form.controls.location.value,
      bounds: this.bounds
    };
  }

  setupForm(data: AreaFormModel) {
    this.form = this.fb.group({
      location: [data.location, []],
      bounds: [data.bounds, []]
    });
  }

  fromModel(model: Organization): AreaFormModel {
    return {
      location: model.location,
      bounds: model.bounds
   };
  }

  toModel(data: AreaFormModel, model: Organization): Organization {
    model.location = data.location || null;
    model.bounds = data.bounds || null;
    return model;
  }
}
