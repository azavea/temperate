import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import {
  City,
  Indicator,
  IndicatorService
} from 'climate-change-components';
import { ToastrService } from 'ngx-toastr';

import {
  OrgRiskDirectionalFrequencyOptions,
  OrgRiskDirectionalIntensityOptions,
  OrgRiskDirectionalOption,
  OrgRiskRelativeChanceOptions,
  OrgRiskRelativeOption,
  Risk,
} from '../../../shared/';

import { PreviousRouteGuard } from '../../../core/services/previous-route-guard.service';
import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
// tslint:disable-next-line:max-line-length
import { CollapsibleChartComponent } from '../../../shared/collapsible-chart/collapsible-chart.component';
import { ModalTemplateComponent } from '../../../shared/modal-template/modal-template.component';
import { RiskStepKey } from '../../risk-step-key';
import { RiskWizardStepComponent } from '../../risk-wizard-step.component';

import { CityService } from '../../../core/services/city.service';

interface HazardStepFormModel {
  frequency: OrgRiskDirectionalOption;
  intensity: OrgRiskDirectionalOption;
  probability: OrgRiskRelativeOption;
}

@Component({
  selector: 'app-risk-step-hazard',
  templateUrl: 'hazard-step.component.html'
})

export class HazardStepComponent extends RiskWizardStepComponent<HazardStepFormModel>
                                 implements OnDestroy, OnInit {

  public key = RiskStepKey.Hazard;
  public navigationSymbol = '2';
  public risk: Risk;
  public title = 'Hazard';

  public frequencyOptions = OrgRiskDirectionalFrequencyOptions;
  public intensityOptions = OrgRiskDirectionalIntensityOptions;
  public relativeOptions = OrgRiskRelativeChanceOptions;
  // Can't *ngFor a map type or iterable, so instead we realize the iterable and use that in *ngFors
  public directionalFrequencyOptionsKeys = Array.from(OrgRiskDirectionalFrequencyOptions.keys());
  public directionalIntensityOptionsKeys = Array.from(OrgRiskDirectionalIntensityOptions.keys());
  public city: City;
  public indicators: Indicator[] = [];

  @ViewChild('indicatorChartModal')
  private indicatorsModal: ModalTemplateComponent;

  private sessionSubscription: Subscription;

  public probabilityTooltipText = `Viewing related indicators helps you think through probability
    and frequency. If there are no available data for this hazard, you may want to consult the
    National Climate Assessment, States At Risk, or use the help icon to contact ICLEI-USA.`;

  constructor(protected session: WizardSessionService<Risk>,
              protected riskService: RiskService,
              protected toastr: ToastrService,
              protected router: Router,
              protected previousRouteGuard: PreviousRouteGuard,
              private cityService: CityService,
              private fb: FormBuilder,
              private indicatorService: IndicatorService) {
    super(session, riskService, toastr, router, previousRouteGuard);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData();
    this.setupForm(this.fromModel(this.risk));
    // Load initial risk indicators and subscribe to watch for weather event changes after
    this.updateRiskIndicators();
    this.cityService.current().subscribe(city => { this.city = city; });
    this.setDisabled(this.risk);

    this.sessionSubscription = this.session.data.subscribe(risk => {
      this.risk = risk;
      this.updateRiskIndicators();
      this.setDisabled(risk);
    });
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
  }

  getFormModel(): HazardStepFormModel {
    const data: HazardStepFormModel = {
      frequency: this.form.controls.frequency.value,
      intensity: this.form.controls.intensity.value,
      probability: this.form.controls.probability.value
    };
    return data;
  }

  updateRiskIndicators() {
    this.indicatorService.list().subscribe(indicators => {
      this.indicators = indicators.filter(indicator => {
        if (this.risk.weather_event && this.risk.weather_event.indicators) {
          return this.risk.weather_event.indicators.includes(indicator.name);
        } else {
          return false;
        }
      });
    });
  }

  updateDirectionalControl(control: FormControl, value: OrgRiskDirectionalOption) {
    control.setValue(value);
    control.markAsDirty();
  }

  setupForm(data: HazardStepFormModel) {
    this.form = this.fb.group({
      'frequency': [data.frequency, []],
      'intensity': [data.intensity, []],
      'probability': [data.probability, []],
    });
  }

  fromModel(model: Risk): HazardStepFormModel {
    return {
      frequency: model.frequency,
      intensity: model.intensity,
      probability: model.probability
    };
  }

  toModel(data: HazardStepFormModel, model: Risk): Risk {
    model.frequency = data.frequency;
    model.intensity = data.intensity;
    model.probability = data.probability;
    return model;
  }

  public openModal() {
    this.indicatorsModal.open();
  }

  isStepComplete(): boolean {
    return !!this.form.controls.frequency.value && !!this.form.controls.intensity.value
      && !!this.form.controls.probability.value;
  }

  relatedIndicatorsTooltip(): string {
    if (this.indicators.length === 0) {
      return `No related indicators for ${this.risk.weather_event.name}`;
    }
  }
}
