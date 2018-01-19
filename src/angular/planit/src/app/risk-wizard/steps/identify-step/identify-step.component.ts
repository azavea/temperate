import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ToastrService } from 'ngx-toastr';

import {
  CommunitySystem,
  Risk,
  WeatherEvent,
  WizardStepComponent
} from '../../../shared/';

import { CommunitySystemService } from '../../../core/services/community-system.service';
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
                                   implements OnInit {

  public formValid: boolean;
  public key: RiskStepKey = RiskStepKey.Identify;
  public navigationSymbol = '1';
  public title = 'Identify risk';

  public weatherEvents: WeatherEvent[] = [];
  public communitySystems: CommunitySystem[] = [];

  private weather_event: WeatherEvent;
  private community_system: CommunitySystem;


  constructor(protected fb: FormBuilder,
              protected session: WizardSessionService<Risk>,
              protected riskService: RiskService,
              protected toastr: ToastrService,
              private router: Router,
              private weatherEventService: WeatherEventService,
              private communitySystemService: CommunitySystemService) {
    super(fb, session, riskService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    const risk = this.session.getData();
    this.setupForm(this.fromModel(risk));

    this.weather_event = risk.weather_event || null;
    this.community_system = risk.community_system || null;

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
    const options = key === 'weather_event' ? this.weatherEvents : this.communitySystems;

    // The order in which itemSelected and itemBlurred fire is unpredictable,
    // so wait to give itemSelected a chance to update the form value.
    setTimeout(() => {
      const val = this.form.controls[key].value;
      const found = options.find(option => option.name === val);
      if (!found) {
        this.form.controls[key].setErrors({'autocomplete': true});
      }
    }, 500);
  }
}
