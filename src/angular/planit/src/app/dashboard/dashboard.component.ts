import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import { DownloadService } from '../core/services/download.service';
import { OrganizationService } from '../core/services/organization.service';
import { RiskService } from '../core/services/risk.service';
import { WeatherEventService } from '../core/services/weather-event.service';
import { OrgWeatherEvent, Organization, Risk, User, WeatherEvent } from '../shared/';
import { ModalTemplateComponent } from '../shared/modal-template/modal-template.component';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public groupedRisks: any[];
  public selectedEventsControl = new FormControl([]);

  private organization: Organization;
  private weatherEvents: WeatherEvent[];
  private weatherEventIdsAtLastSave: number[] = [];

  constructor(private downloadService: DownloadService,
              private organizationService: OrganizationService,
              private riskService: RiskService,
              private route: ActivatedRoute,
              private weatherEventService: WeatherEventService) { }

  ngOnInit() {
    this.getGroupedRisks();
    this.weatherEventService.list().subscribe(events => {
      this.weatherEvents = events;
      this.setSelectedEvents(this.organization.weather_events);
    });
    this.route.data.subscribe((data: {user: User}) => {
      this.organization = data.user.primary_organization;
    });
  }

  cancelModal(modal: ModalTemplateComponent) {
    this.setSelectedEvents(this.weatherEventIdsAtLastSave);
    modal.close();
  }

  downloadPlan() {
    const url = `${environment.apiUrl}/api/export-plan/`;
    const filename = 'adaptation_plan';

    this.downloadService.downloadCSV(url, filename);
  }

  openModal(modal: ModalTemplateComponent) {
    modal.open();
  }

  saveWeatherEventsModal(modal: ModalTemplateComponent) {
    // Trigger spinner display so that it's shown for both the save queries and the
    //  grouped risks requery
    this.groupedRisks = undefined;
    const selectedEvents = this.selectedEventsControl.value as WeatherEvent[];
    this.saveEventsToAPI(selectedEvents)
      .finally(() => this.getGroupedRisks())
      .subscribe(results => this.handleAPISave(results));
    modal.close();
  }

  get weatherEventsAtLastSave() {
    if (this.weatherEvents) {
      return this.weatherEvents.filter(e => this.weatherEventIdsAtLastSave.includes(e.id));
    }
    return [];
  }

  private getGroupedRisks() {
    this.groupedRisks = undefined;
    this.riskService.groupByWeatherEvent().subscribe(r => {
      this.groupedRisks = Array.from(r.values());
    });
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
