import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, forkJoin, onErrorResumeNext } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

import { CacheService } from '../core/services/cache.service';
import { OrganizationService } from '../core/services/organization.service';
import { PlanService } from '../core/services/plan.service';
import { RiskService } from '../core/services/risk.service';
import { UserService } from '../core/services/user.service';
import { WeatherEventService } from '../core/services/weather-event.service';
import { Organization, Risk, User, WeatherEvent } from '../shared/';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { ModalTemplateComponent } from '../shared/modal-template/modal-template.component';

enum ViewTabs {
  Grouped,
  Assessment,
  ActionSteps,
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  @ViewChild('confirmDeleteModal', { static: true })
  confirmDeleteModal: ConfirmationModalComponent;

  @ViewChild('weatherEventsModal', { static: true })
  weatherEventsModal: ModalTemplateComponent;

  public risks: Risk[];
  public groupedRisks: Risk[][];
  public organization: Organization;
  public selectedEventsControl = new FormControl([]);
  public trialDaysRemaining: number;

  public viewTab = ViewTabs.Grouped;
  public viewTabs = ViewTabs;

  private weatherEvents: WeatherEvent[];

  @ViewChild('trialWarningModal', { static: true })
  private trialWarningModal: ModalTemplateComponent;

  constructor(
    private cache: CacheService,
    private organizationService: OrganizationService,
    private userService: UserService,
    public planService: PlanService,
    private riskService: RiskService,
    private route: ActivatedRoute,
    private router: Router,
    private weatherEventService: WeatherEventService
  ) {}

  ngOnInit() {
    this.getRisks();
    forkJoin([this.weatherEventService.list(), this.userService.current()]).subscribe(
      ([events, user]: [WeatherEvent[], User]) => {
        this.weatherEvents = events;
        this.organization = user.primary_organization;
        this.setSelectedEvents();

        const shownWarning = this.cache.get(CacheService.APP_DASHBOARD_TRIALWARNING);
        if (!shownWarning) {
          this.trialDaysRemaining = this.organization.trialDaysRemaining();
          if (this.organization.isFreeTrial() && this.trialDaysRemaining <= 3) {
            this.openModal(this.trialWarningModal);
            this.cache.set(CacheService.APP_DASHBOARD_TRIALWARNING, true);
          }
        }
      }
    );
  }

  onRisksChanged() {
    this.groupedRisks = this.getGroupedRisks();
  }

  cancelModal(modal: ModalTemplateComponent) {
    this.setSelectedEvents();
    modal.close();
  }

  openModal(modal: ModalTemplateComponent) {
    setTimeout(() => {
      modal.open();
    });
  }

  setSelectedEvents() {
    this.selectedEventsControl.setValue(this.weatherEventsAtLastSave());
  }

  upgradeSubscription() {
    this.trialWarningModal.close();
    this.router.navigate(['subscription']);
  }

  saveWeatherEventsModal(modal: ModalTemplateComponent) {
    const selectedEvents = this.selectedEventsControl.value as WeatherEvent[];
    const deletedEvents = this.weatherEventsAtLastSave().filter(
      event => !selectedEvents.some(e => e.id === event.id)
    );
    if (deletedEvents.length > 0) {
      this.weatherEventsModal.close();
      this.deleteRisksForWeatherEvents(deletedEvents)
        .pipe(
          catchError(err => {
            this.weatherEventsModal.open();
            throw err;
          }),
          onErrorResumeNext
        )
        .subscribe(() => {
          this.saveEventsModal(selectedEvents, modal);
        });
    } else {
      this.saveEventsModal(selectedEvents, modal);
    }
  }

  weatherEventsAtLastSave() {
    if (this.weatherEvents) {
      return this.weatherEvents.filter(e => this.organization.weather_events.includes(e.id));
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

  onRisksDeleted(weatherEvent: WeatherEvent) {
    this.risks = this.risks.filter(risk => risk.weather_event.id !== weatherEvent.id);
    this.groupedRisks = this.getGroupedRisks();
  }

  private getGroupedRisks(): Risk[][] {
    if (this.risks === undefined) {
      return undefined;
    }

    const groupedRisks = RiskService.groupByWeatherEvent(this.risks);
    const names = Array.from(groupedRisks.keys()).sort();
    return Array.from(names.map(name => groupedRisks.get(name)));
  }

  private saveEventsModal(selectedEvents: WeatherEvent[], modal: ModalTemplateComponent) {
    // Trigger spinner display so that it's shown for both the save queries and the
    // risks requery
    this.risks = undefined;
    this.saveEventsToAPI(selectedEvents)
      .pipe(finalize(() => this.getRisks()))
      .subscribe();
    modal.close();
  }

  private saveEventsToAPI(events: WeatherEvent[]): Observable<Organization> {
    this.organization.weather_events = events.map(e => e.id);
    return this.organizationService.update(this.organization);
  }

  private deleteRisksForWeatherEvents(events: WeatherEvent[]): Observable<unknown> {
    const risks = this.risks.filter(r => events.some(event => event.id === r.weather_event.id));

    return this.confirmDeleteModal
      .confirm({
        tagline: Risk.deleteRisksTagline(risks, events),
        confirmText: 'Delete',
      })
      .pipe(switchMap(() => this.riskService.deleteMany(risks)));
  }

  public resetScroll() {
    window.scrollTo(0, 0);
  }
}
