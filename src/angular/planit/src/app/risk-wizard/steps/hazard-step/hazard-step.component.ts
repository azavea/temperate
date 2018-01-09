import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import {
  City,
  Indicator,
  IndicatorService
} from 'climate-change-components';

import {
  OrgRiskDirectionalOption,
  OrgRiskDirectionalOptions,
  OrgRiskRelativeOption,
  OrgRiskRelativeChanceOptions,
  Risk,
  WizardStepComponent } from '../../../shared/';
import { RiskStepKey } from '../../risk-step-key';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
// tslint:disable-next-line:max-line-length
import { CollapsibleChartComponent } from '../../../shared/collapsible-chart/collapsible-chart.component';
import { ModalTemplateComponent } from '../../../shared/modal-template/modal-template.component';

interface HazardStepFormModel {
  frequency: OrgRiskDirectionalOption;
  intensity: OrgRiskDirectionalOption;
  probability: OrgRiskRelativeOption;
}

@Component({
  selector: 'app-risk-step-hazard',
  templateUrl: 'hazard-step.component.html'
})

export class HazardStepComponent extends WizardStepComponent<Risk, HazardStepFormModel>
                                 implements OnInit {

  public form: FormGroup;
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
  public indicators: Indicator[];

  @ViewChild('indicatorChartModal')
  private indicatorsModal: ModalTemplateComponent;

  constructor(private fb: FormBuilder,
              private indicatorService: IndicatorService,
              protected session: WizardSessionService<Risk>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData() || new Risk({});
    this.setupForm(this.fromModel(this.risk));
    this.form.get('intensity').valueChanges.subscribe(v => console.log('intensity: ', v));

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
        return this.risk.weatherEvent.indicators.includes(indicator.name);
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

  toModel(data: HazardStepFormModel, model: Risk) {
    model.frequency = data.frequency;
    model.intensity = data.intensity;
    model.probability = data.probability;
    return model;
  }

  public openModal() {
    this.indicatorsModal.open();
  }
}
