import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

import { CommunitySystem,
         Risk,
         WeatherEvent,
         WizardStepComponent } from '../../../shared/';

import { CommunitySystemService } from '../../../core/services/community-system.service';
import { WeatherEventService } from '../../../core/services/weather-event.service';
import { WizardSessionService } from '../../../core/services/wizard-session.service';

import { RiskStepKey } from '../../risk-step-key';

interface IdentifyStepFormModel {
  weatherEvent: WeatherEvent;
  communitySystem: CommunitySystem;
}

@Component({
  selector: 'app-risk-step-identify',
  templateUrl: 'identify-step.component.html'
})
export class IdentifyStepComponent extends WizardStepComponent<Risk, IdentifyStepFormModel>
                                   implements OnInit {

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

  save() {}

  fromModel(risk: Risk): IdentifyStepFormModel {
    return {
      weatherEvent: risk.weatherEvent,
      communitySystem: risk.communitySystem
    };
  }

  getFormModel(): IdentifyStepFormModel {
    const data: IdentifyStepFormModel = {
      weatherEvent: this.weatherEvent,
      communitySystem: this.communitySystem
    };
    return data;
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
    const options = key === 'weatherEvent' ? this.weatherEvents : this.communitySystems;

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
