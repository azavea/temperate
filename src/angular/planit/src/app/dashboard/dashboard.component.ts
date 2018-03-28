import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import { CacheService } from '../core/services/cache.service';
import { OrganizationService } from '../core/services/organization.service';
import { PlanService } from '../core/services/plan.service';
import { RiskService } from '../core/services/risk.service';
import { UserService } from '../core/services/user.service';
import { WeatherEventService } from '../core/services/weather-event.service';
import { Organization, Risk, User, WeatherEvent } from '../shared/';
import { ModalTemplateComponent } from '../shared/modal-template/modal-template.component';

enum ViewTabs {
  Grouped,
  Assessment,
  ActionSteps
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  public risks: Risk[];
  public groupedRisks: Risk[][];
  public organization: Organization;
  public selectedEventsControl = new FormControl([]);
  public trialDaysRemaining: number;

  public viewTab = ViewTabs.Grouped;
  public viewTabs = ViewTabs;

  private weatherEvents: WeatherEvent[];
  private weatherEventIdsAtLastSave: number[] = [];

  @ViewChild('trialWarningModal') private trialWarningModal: ModalTemplateComponent;

  constructor(private cache: CacheService,
              private organizationService: OrganizationService,
              private userService: UserService,
              public planService: PlanService,
              private riskService: RiskService,
              private route: ActivatedRoute,
              private router: Router,
              private weatherEventService: WeatherEventService) { }

  ngOnInit() {
    this.getRisks();
    this.weatherEventService.list().subscribe(events => {
      this.weatherEvents = events;
      this.setSelectedEvents(this.organization.weather_events);
    });
    this.route.data.subscribe((data: {user: User}) => {
      this.organization = data.user.primary_organization;

      const shownWarning = this.cache.get(CacheService.APP_DASHBOARD_TRIALWARNING);
      if (!shownWarning) {
        this.trialDaysRemaining = this.organization.trialDaysRemaining();
        if (this.organization.isFreeTrial() && this.trialDaysRemaining <= 3) {
          this.openModal(this.trialWarningModal);
          this.cache.set(CacheService.APP_DASHBOARD_TRIALWARNING, true);
        }
      }
    });
  }

  onRisksChanged() {
    this.groupedRisks = this.getGroupedRisks();
  }

  cancelModal(modal: ModalTemplateComponent) {
    this.setSelectedEvents(this.weatherEventIdsAtLastSave);
    modal.close();
  }

  openModal(modal: ModalTemplateComponent) {
    setTimeout(() => {
      modal.open();
    });
  }

  upgradeSubscription() {
    this.trialWarningModal.close();
    this.router.navigate(['subscription']);
  }

  saveWeatherEventsModal(modal: ModalTemplateComponent) {
    // Trigger spinner display so that it's shown for both the save queries and the
    // risks requery
    this.risks = undefined;
    const selectedEvents = this.selectedEventsControl.value as WeatherEvent[];
    this.saveEventsToAPI(selectedEvents)
      .finally(() => this.getRisks())
      .subscribe(results => this.handleAPISave(results));
    modal.close();
  }

  get weatherEventsAtLastSave() {
    if (this.weatherEvents) {
      return this.weatherEvents.filter(e => this.weatherEventIdsAtLastSave.includes(e.id));
    }
    return [];
  }

  get areAnyRisksAssessed(): boolean {
    return Risk.areAnyRisksAssessed(this.risks);
  }

  getRisks() {
    this.risks = undefined;
    this.riskService.list().subscribe(risks => {
      this.risks = risks;
      this.groupedRisks = this.getGroupedRisks();
    });
  }

  private getGroupedRisks(): Risk[][] {
    if (this.risks === undefined) {
      return undefined;
    }

    const groupedRisks = RiskService.groupByWeatherEvent(this.risks);
    const names = Array.from(groupedRisks.keys()).sort();
    return Array.from(names.map(name => groupedRisks.get(name)));
  }

  private setSelectedEvents(eventIds: number[]) {
    this.weatherEventIdsAtLastSave = eventIds;
    this.selectedEventsControl.setValue(this.weatherEventsAtLastSave);
  }

  private handleAPISave(organization: Organization) {
    this.weatherEventIdsAtLastSave = organization.weather_events;
  }

  private saveEventsToAPI(events: WeatherEvent[]): Observable<Organization> {

    this.organization.weather_events = events.map(e => e.id);
    return this.organizationService.update(this.organization);
  }
}
