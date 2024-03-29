import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { ImpactService } from '../../../core/services/impact.service';
import { PreviousRouteGuard } from '../../../core/services/previous-route-guard.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import {
  Impact,
  OrgRiskRelativeImpactOptions,
  OrgRiskRelativeOption,
  Risk,
  WizardStepComponent
} from '../../../shared/';
import { ImpactMapModalComponent } from '../../../shared/impact-map/impact-map-modal.component';
import { RiskStepKey } from '../../risk-step-key';
import { RiskWizardStepComponent } from '../../risk-wizard-step.component';

export interface ImpactStepFormModel {
  impact_magnitude: OrgRiskRelativeOption;
  impact_description?: string;
}

@Component({
  selector: 'app-risk-step-impact',
  templateUrl: 'impact-step.component.html'
})

export class ImpactStepComponent extends RiskWizardStepComponent<ImpactStepFormModel>
                                 implements OnDestroy, OnInit {

  @ViewChild('impactsMapModal', {static: true})
  private impactsMapModal: ImpactMapModalComponent;

  public mapImpact: Impact;

  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Impact;
  public navigationSymbol = '3';
  public risk: Risk;
  public title = 'Potential impact';
  public impacts: Impact[] = [];
  public showAllImpacts = false;
  public initialImpactsToShow = 3;

  public relativeOptions = OrgRiskRelativeImpactOptions;

  private sessionSubscription: Subscription;


  constructor(protected session: WizardSessionService<Risk>,
              protected riskService: RiskService,
              protected toastr: ToastrService,
              protected router: Router,
              protected previousRouteGuard: PreviousRouteGuard,
              private impactService: ImpactService,
              private fb: FormBuilder) {
    super(session, riskService, toastr, router, previousRouteGuard);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData();
    this.setupForm(this.fromModel(this.risk));
    this.setDisabled(this.risk);
    this.sessionSubscription = this.session.data.subscribe(risk => {
      this.risk = risk;
      this.setDisabled(risk);

      this.impactService.rankedFor(risk.weather_event, risk.community_system).subscribe(impacts => {
        this.impacts = impacts;
      });
    });
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
  }

  getFormModel(): ImpactStepFormModel {
    const data: ImpactStepFormModel = {
      impact_magnitude: this.form.controls.impact_magnitude.value,
      impact_description: this.form.controls.impact_description.value
    };
    return data;
  }

  setupForm(data: ImpactStepFormModel) {
    this.form = this.fb.group({
      'impact_magnitude': [data.impact_magnitude, []],
      'impact_description': [data.impact_description, []]
    });
  }

  fromModel(model: Risk): ImpactStepFormModel {
    return {
      impact_magnitude: model.impact_magnitude,
      impact_description: model.impact_description
    };
  }

  toModel(data: ImpactStepFormModel, model: Risk) {
    model.impact_magnitude = data.impact_magnitude;
    model.impact_description = data.impact_description;
    return model;
  }

  isStepComplete(): boolean {
    return !!this.form.controls.impact_magnitude.value;
  }

  pasteImpact(impact: Impact) {
    let description = this.form.controls.impact_description.value;
    const impactText = impact.tagline ? impact.tagline : impact.label;
    if (description !== '') {
      description += '\n';
    }
    description += impactText;
    this.form.controls.impact_description.setValue(description);
  }

  openMapModal(impact: Impact) {
    this.mapImpact = impact;
    this.impactsMapModal.show();
  }
}
