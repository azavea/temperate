import {
  AfterViewChecked,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';

import { MovingDirection } from 'ng2-archwizard';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Subscription';

import { CommunitySystemService } from '../../../../core/services/community-system.service';
import { OrganizationService } from '../../../../core/services/organization.service';
import { WizardSessionService } from '../../../../core/services/wizard-session.service';
import { CommunitySystem, Organization } from '../../../../shared/';

import { PlanStepKey } from '../../plan-step-key';
import { PlanWizardStepComponent } from '../../plan-wizard-step.component';

export interface CommunitySystemsFormModel {
  selectedCommunitySystems: CommunitySystem[];
}

@Component({
  selector: 'app-plan-step-community-systems',
  templateUrl: 'community-systems-step.component.html'
})

export class CommunitySystemsStepComponent
  extends PlanWizardStepComponent<CommunitySystemsFormModel>
  implements OnInit {

  public form: FormGroup;
  public navigationSymbol = '3';
  public title = 'Community Systems';

  private communitySystems: CommunitySystem[] = [];

  @Output() wizardCompleted = new EventEmitter();

  public organization: Organization;
  public key: PlanStepKey = PlanStepKey.CommunitySystems;

  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected toastr: ToastrService,
              private communitySystemService: CommunitySystemService,
              private fb: FormBuilder) {
    super(session, orgService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    this.organization = this.session.getData();
    this.communitySystemService.list().subscribe(systems => {
      this.communitySystems = systems;
      const orgCommunitySystems = this.getOrganizationSystems(this.organization);
      this.form.controls.selectedCommunitySystems.setValue(orgCommunitySystems);
    });
    this.setupForm(this.fromModel(this.organization));
  }

  getFormModel(): CommunitySystemsFormModel {
    return {
      selectedCommunitySystems: this.form.controls.selectedCommunitySystems.value
    };
  }

  setupForm(data: CommunitySystemsFormModel) {
    this.form = this.fb.group({
      selectedCommunitySystems: [data.selectedCommunitySystems, []]
    });
  }

  fromModel(model: Organization): CommunitySystemsFormModel {
    return {
      selectedCommunitySystems: this.getOrganizationSystems(model)
   };
  }

  toModel(data: CommunitySystemsFormModel, model: Organization): Organization {
    model.community_systems = data.selectedCommunitySystems.map(e => e.id);
    return model;
  }

  private getOrganizationSystems(organization) {
    return this.communitySystems.filter(e => organization.community_systems.includes(e.id));
  }

  finish() {
    this.save(MovingDirection.Forwards).then((success) => {
      if (success) {
        this.wizardCompleted.emit({});
      } else {
        console.error('Failed to save in community systems step');
      }
    });
  }
}
