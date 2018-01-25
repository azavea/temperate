import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import {
  City,
  Indicator,
  IndicatorService
} from 'climate-change-components';
import { ToastrService } from 'ngx-toastr';

import {
  OrgRiskDirectionalOption,
  OrgRiskDirectionalOptions,
  OrgRiskRelativeChanceOptions,
  OrgRiskRelativeOption,
  Risk,
} from '../../../shared/';

import { RiskService } from '../../../core/services/risk.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
// tslint:disable-next-line:max-line-length
import { CollapsibleChartComponent } from '../../../shared/collapsible-chart/collapsible-chart.component';
import { ModalTemplateComponent } from '../../../shared/modal-template/modal-template.component';
import { RiskStepKey } from '../../risk-step-key';
import { RiskWizardStepComponent } from '../../risk-wizard-step.component';

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
                                 implements OnInit {

  public key = RiskStepKey.Hazard;
  public navigationSymbol = '2';
  public risk: Risk;
  public title = 'Hazard';
  public tooltipText = {
    frequency: 'Estimation of the change in how often this hazard will occur in the future',
    intensity: 'Estimation of the change in strength of this hazard in the future'
  };

  public directionalOptions = OrgRiskDirectionalOptions;
  public relativeOptions = OrgRiskRelativeChanceOptions;
  // Can't *ngFor a map type or iterable, so instead we realize the iterable and use that in *ngFors
  public directionalOptionsKeys = Array.from(OrgRiskDirectionalOptions.keys());
  public relativeOptionsKeys = Array.from(OrgRiskRelativeChanceOptions.keys());
  public city: City;
  public indicators: Indicator[] = [];

  @ViewChild('indicatorChartModal')
  private indicatorsModal: ModalTemplateComponent;

  constructor(protected session: WizardSessionService<Risk>,
              protected riskService: RiskService,
              protected toastr: ToastrService,
              private fb: FormBuilder,
              private indicatorService: IndicatorService) {
    super(session, riskService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData();
    this.setupForm(this.fromModel(this.risk));

    // TODO (issue #404): Replace with the user's organization location
    this.city = {
      id: '7',
      type: 'feature',
      geometry: { type: 'Point', coordinates: [-75.16379, 39.95233] },
      properties: {
        name: 'Philadelphia',
        admin: 'PA',
        datasets: ['NEX-GDDP', 'LOCA'],
        region: 11
      },
    };

    // Load initial risk indicators and subscribe to watch for weather event changes after
    this.updateRiskIndicators();
    this.session.data.subscribe(() => this.updateRiskIndicators());
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
        if (this.risk.weather_event.indicators) {
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
