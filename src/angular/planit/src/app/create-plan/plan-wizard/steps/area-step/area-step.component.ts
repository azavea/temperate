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
import { WizardSessionService } from '../../../../core/services/wizard-session.service';
import { CommunitySystem, Organization } from '../../../../shared/';

import { PlanStepKey } from '../../plan-step-key';
import { PlanWizardStepComponent } from '../../plan-wizard-step.component';

export interface AreaFormModel {
  area?: MultiPolygon;
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

  private area?: MultiPolygon = null;

  @Output() wizardCompleted = new EventEmitter();

  public organization: Organization;
  public key: PlanStepKey = PlanStepKey.Area;

  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected toastr: ToastrService,
              private fb: FormBuilder) {
    super(session, orgService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    this.organization = this.session.getData();
    this.setupForm(this.fromModel(this.organization));
  }

  getFormModel(): AreaFormModel {
    return {
      area: null
    };
  }

  setupForm(data: AreaFormModel) {
    this.form = this.fb.group({
      area: [data.area, []]
    });
  }

  fromModel(model: Organization): AreaFormModel {
    return {
      area: null
   };
  }

  toModel(data: AreaFormModel, model: Organization): Organization {
    return model;
  }
}
