import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

import { CommunitySystem, Risk, WeatherEvent } from '../../shared/';

import { CommunitySystemService } from '../../core/services/community-system.service';
import { WeatherEventService } from '../../core/services/weather-event.service';

import { RiskStepKey } from '../risk-step-key';
import { WizardStepComponent } from '../../wizard/';
import { WizardSessionService } from '../../core/services/wizard-session.service';

interface IdentifyStepFormModel {
  weatherEvent: WeatherEvent;
  communitySystem: CommunitySystem;
}

@Component({
  selector: 'app-risk-step-identify',
  templateUrl: 'identify-step.component.html'
})
export class IdentifyStepComponent extends WizardStepComponent<Risk> implements OnInit {

  public form: FormGroup;
  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Identify;
  public navigationSymbol = '1';
  public title = 'Identify risk';

  public weatherEvents: WeatherEvent[] = [];
  public communitySystems: CommunitySystem[] = [];

  private weatherEvent: WeatherEvent;
  private communitySystem: CommunitySystem;


  constructor(private fb: FormBuilder,
              private router: Router,
              private weatherEventService: WeatherEventService,
              private communitySystemService: CommunitySystemService,
              protected session: WizardSessionService<Risk>) {
    super(session);
  }

  ngOnInit() {
    super.ngOnInit();
    const risk = this.session.getData();
    this.setupForm(this.fromModel(risk));

    this.weatherEvent = risk.weatherEvent || null;
    this.communitySystem = risk.communitySystem || null;

    this.weatherEventService.list()
      .subscribe(weatherEvents => this.weatherEvents = weatherEvents);
    this.communitySystemService.list()
      .subscribe(communitySystems => this.communitySystems = communitySystems);
  }

  cancel() {
    this.router.navigate(['assessment']);
  }

  fromModel(risk: Risk): IdentifyStepFormModel {
    return {
      weatherEvent: risk.weatherEvent,
      communitySystem: risk.communitySystem
    };
  }

  save() {
    const data: IdentifyStepFormModel = {
      weatherEvent: this.weatherEvent,
      communitySystem: this.communitySystem
    };
    this.session.setDataForKey(this.key, data);
  }

  setupForm(data: IdentifyStepFormModel) {
    this.form = this.fb.group({
      'weatherEvent': [data.weatherEvent ? data.weatherEvent.name : '',
                       [Validators.required]],
      'communitySystem': [data.communitySystem ? data.communitySystem.name : '',
                          [Validators.required]]
    });
  }

  toModel(data: IdentifyStepFormModel, risk: Risk) {
    risk.weatherEvent = data.weatherEvent;
    risk.communitySystem = data.communitySystem;
    return risk;
  }

  itemSelected(key: string, event: TypeaheadMatch | null) {
    const savedName = this[key] ? this[key].name : null;
    const formName = this.form.controls[key].value;
    if (event !== null || savedName !== formName) {
      this[key] = event && event.item ? event.item : null;
    }
  }

  itemBlurred(key: string) {
    // Manually set form error if user exits field without selecting
    // a valid autocomplete option.
    const options = key === 'weatherEvents' ? this.weatherEvents : this.communitySystems;
    if (options.indexOf(this.form.controls[key].value) < 0) {
      this.form.controls[key].setErrors({'autocomplete': true});
    }
  }
}
