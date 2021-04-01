import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable, Subscription } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

import {
  Location,
  OrgRiskDirectionalFrequencyOptions,
  OrgRiskDirectionalIntensityOptions,
  OrgRiskDirectionalOption,
  OrgRiskRelativeChanceOptions,
  OrgRiskRelativeOption,
  OrgWeatherEvent,
  Risk,
  WeatherEvent,
} from '../../../shared/';

import { Indicator, IndicatorService } from '../../../climate-api';
import { PreviousRouteGuard } from '../../../core/services/previous-route-guard.service';
import { RiskService } from '../../../core/services/risk.service';
import { WeatherEventService } from '../../../core/services/weather-event.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';
import { ModalTemplateComponent } from '../../../shared/modal-template/modal-template.component';
import { RiskStepKey } from '../../risk-step-key';
import { RiskWizardStepComponent } from '../../risk-wizard-step.component';

import { UserService } from '../../../core/services/user.service';
import { map } from 'rxjs/operators';

interface HazardStepFormModel {
  frequency: OrgRiskDirectionalOption;
  intensity: OrgRiskDirectionalOption;
  probability: OrgRiskRelativeOption;
}

@Component({
  selector: 'app-risk-step-hazard',
  templateUrl: 'hazard-step.component.html',
})
export class HazardStepComponent
  extends RiskWizardStepComponent<HazardStepFormModel>
  implements OnDestroy, OnInit {
  public key = RiskStepKey.Hazard;
  public navigationSymbol = '2';
  public location: Location;
  public risk: Risk;
  public title = 'Hazard';

  public frequencyOptions = OrgRiskDirectionalFrequencyOptions;
  public intensityOptions = OrgRiskDirectionalIntensityOptions;
  public relativeOptions = OrgRiskRelativeChanceOptions;
  // Can't *ngFor a map type or iterable, so instead we realize the iterable and use that in *ngFors
  public directionalFrequencyOptionsKeys = Array.from(OrgRiskDirectionalFrequencyOptions.keys());
  public directionalIntensityOptionsKeys = Array.from(OrgRiskDirectionalIntensityOptions.keys());
  public indicators: Indicator[] = [];

  public orgWeatherEvents: OrgWeatherEvent[] = [];

  @ViewChild('indicatorChartModal', { static: true })
  private indicatorsModal: ModalTemplateComponent;

  private sessionSubscription: Subscription;

  public probabilityTooltipText = `Viewing related indicators helps you think through probability
    and frequency. If there are no available data for this hazard, you may want to consult the
    National Climate Assessment, States At Risk, or use the help icon to contact ICLEI-USA.`;

  constructor(
    protected session: WizardSessionService<Risk>,
    protected riskService: RiskService,
    protected toastr: ToastrService,
    protected router: Router,
    protected previousRouteGuard: PreviousRouteGuard,
    private weatherEventService: WeatherEventService,
    private userService: UserService,
    private fb: FormBuilder,
    private indicatorService: IndicatorService
  ) {
    super(session, riskService, toastr, router, previousRouteGuard);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData();
    this.setupForm(this.fromModel(this.risk));
    // Load initial risk indicators and subscribe to watch for weather event changes after
    this.updateRiskIndicators();
    this.userService.current().subscribe(user => {
      this.location = user.primary_organization.location;
    });
    this.setDisabled(this.risk);

    this.sessionSubscription = this.session.data.subscribe(risk => {
      this.risk = risk;
      this.updateRiskIndicators();
      this.setDisabled(risk);
    });

    this.weatherEventService.listForCurrentOrg().subscribe(orgWeatherEvents => {
      this.orgWeatherEvents = orgWeatherEvents;
      this.setupForm(this.fromModel(this.risk));
    });
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
  }

  getFormModel(): HazardStepFormModel {
    const data: HazardStepFormModel = {
      frequency: this.form.controls.frequency.value,
      intensity: this.form.controls.intensity.value,
      probability: this.form.controls.probability.value,
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
      frequency: [data.frequency, []],
      intensity: [data.intensity, []],
      probability: [data.probability, []],
    });
  }

  public fromModel: (model: Risk) => HazardStepFormModel = model => {
    const orgWeatherEvent = this.getOrgWeatherEvent(model.weather_event);
    return {
      frequency: orgWeatherEvent && orgWeatherEvent.frequency,
      intensity: orgWeatherEvent && orgWeatherEvent.intensity,
      probability: orgWeatherEvent && orgWeatherEvent.probability,
    };
  };

  public toModel: (data: HazardStepFormModel, model: Risk) => Risk = (data, model) => {
    const orgWeatherEvent = this.getOrgWeatherEvent(model.weather_event);
    orgWeatherEvent.frequency = data.frequency;
    orgWeatherEvent.intensity = data.intensity;
    orgWeatherEvent.probability = data.probability;
    model.organization_weather_event = orgWeatherEvent;
    return model;
  };

  public openModal() {
    this.indicatorsModal.open();
  }

  isStepComplete(): boolean {
    return (
      !!this.form.controls.frequency.value &&
      !!this.form.controls.intensity.value &&
      !!this.form.controls.probability.value
    );
  }

  relatedIndicatorsTooltip(): string {
    if (this.indicators.length === 0) {
      return `No related climate data for ${this.risk.weather_event.name.toLowerCase()}`;
    }
  }

  goToIndicators() {
    this.indicatorsModal.close();
    this.router.navigate(['/indicators']);
  }

  persistChanges(model: Risk): Observable<Risk> {
    return this.weatherEventService.update(model.organization_weather_event).pipe(
      map(organization_weather_event => {
        return new Risk({ ...model, organization_weather_event });
      })
    );
  }

  private getOrgWeatherEvent(weatherEvent: WeatherEvent) {
    return (
      weatherEvent && this.orgWeatherEvents.find(we => we.weather_event.id === weatherEvent.id)
    );
  }
}
