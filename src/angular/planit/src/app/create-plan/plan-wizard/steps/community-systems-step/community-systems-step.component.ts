import {
  AfterViewChecked,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Subscription';

import { OrganizationService } from '../../../../core/services/organization.service';
import { WizardSessionService } from '../../../../core/services/wizard-session.service';
import { Organization } from '../../../../shared/';

import { PlanStepKey } from '../../plan-step-key';
import { PlanWizardStepComponent } from '../../plan-wizard-step.component';

@Component({
  selector: 'app-plan-step-community-systems',
  templateUrl: 'community-systems-step.component.html'
})

export class CommunitySystemsStepComponent extends PlanWizardStepComponent<Organization>
                                           implements OnDestroy, OnInit {

  public navigationSymbol = '3';
  public title = 'Community Systems';

  @Output() wizardCompleted = new EventEmitter();

  public organization: Organization;
  public key: PlanStepKey = PlanStepKey.CommunitySystems;

  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected toastr: ToastrService,
              protected fb: FormBuilder) {
    super(session, orgService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    this.organization = this.session.getData();
  }

  ngOnDestroy() {
  }

  getFormModel(): Organization {
    return this.organization;
  }

  fromModel(model: Organization): Organization {
    return model;
  }

  toModel(data: any, model: Organization) {
    return model;
  }

  setupForm(data: any) {
  }

  finish() {
    // TODO: save model
    this.wizardCompleted.emit({});
  }
}
