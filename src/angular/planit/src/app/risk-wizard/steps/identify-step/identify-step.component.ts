import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ToastrService } from 'ngx-toastr';

import {
  CommunitySystem,
  Risk,
  WeatherEvent,
  WizardStepComponent
} from '../../../shared/';

import { CommunitySystemService } from '../../../core/services/community-system.service';
import { PreviousRouteGuard } from '../../../core/services/previous-route-guard.service';
import { RiskService } from '../../../core/services/risk.service';
import { WeatherEventService } from '../../../core/services/weather-event.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

import { RiskStepKey } from '../../risk-step-key';
import { RiskWizardStepComponent } from '../../risk-wizard-step.component';

interface IdentifyStepFormModel {
  weather_event: WeatherEvent;
  community_system: CommunitySystem;
}

@Component({
  selector: 'app-risk-step-identify',
  templateUrl: 'identify-step.component.html'
})
export class IdentifyStepComponent extends RiskWizardStepComponent<IdentifyStepFormModel>
                                   implements OnDestroy, OnInit {

  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Identify;
  public navigationSymbol = '1';
  public title = 'Identify risk';
  private sessionSubscription: Subscription;

  public risk: Risk;

  public weatherEvents: WeatherEvent[] = [];
  public communitySystems: CommunitySystem[] = [];

  private weather_event: WeatherEvent = null;
  private community_system: CommunitySystem = null;


  constructor(protected session: WizardSessionService<Risk>,
              protected riskService: RiskService,
              protected toastr: ToastrService,
              protected fb: FormBuilder,
              protected router: Router,
              private weatherEventService: WeatherEventService,
              private communitySystemService: CommunitySystemService,
              protected previousRouteGuard: PreviousRouteGuard) {
    super(session, riskService, toastr, router, previousRouteGuard);
  }

  ngOnInit() {
    super.ngOnInit();
    this.risk = this.session.getData();
    this.setupForm(this.fromModel(this.risk));

    if (this.risk.weather_event && this.risk.weather_event.id) {
      this.weather_event = this.risk.weather_event;
    }
    if (this.risk.community_system && this.risk.community_system.id) {
      this.community_system = this.risk.community_system;
    }

    this.weatherEventService.list()
      .subscribe(weatherEvents => this.weatherEvents = weatherEvents);
    this.communitySystemService.list()
      .subscribe(communitySystems => this.communitySystems = communitySystems);

    this.sessionSubscription = this.session.data.subscribe(risk => {
        this.risk = risk;
      });
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
  }

  fromModel(risk: Risk): IdentifyStepFormModel {
    return {
      weather_event: risk.weather_event,
      community_system: risk.community_system
    };
  }

  getFormModel(): IdentifyStepFormModel {
    const data: IdentifyStepFormModel = {
      weather_event: this.weather_event,
      community_system: this.community_system
    };
    return data;
  }

  setupForm(data: IdentifyStepFormModel) {
    this.form = this.fb.group({
      'weather_event': [data.weather_event ? data.weather_event.name : '',
                       [Validators.required]],
      'community_system': [data.community_system ? data.community_system.name : '',
                          [Validators.required]]
    });
  }

  toModel(data: IdentifyStepFormModel, risk: Risk) {
    risk.weather_event = data.weather_event;
    risk.community_system = data.community_system;
    return risk;
  }

  shouldSave() {
    return this.isStepComplete();
  }

  itemSelected(key: string, event: TypeaheadMatch | null) {
    const savedName = this[key] ? this[key].name : null;
    const formName = this.form.controls[key].value;
    if (event !== null || savedName !== formName) {
      this[key] = event && event.item ? event.item : null;
      this.session.setDataForKey(this.key, this.getFormModel());
    }
  }

  itemBlurred(key: string) {
    // Manually set form error if user exits field without selecting
    // a valid autocomplete option.
    const options = key === 'weather_event' ? this.weatherEvents : this.communitySystems;

    const val = this.form.controls[key].value;
    const found = options.find(option => option.name === val);
    if (!found) {
      this[key] = null;
      this.form.controls[key].setErrors({'autocomplete': true});
    } else {
      this[key] = found;
    }
    this.session.setDataForKey(this.key, this.getFormModel());
  }

  isStepComplete() {
    return !!this.weather_event && !!this.community_system;
  }
}
