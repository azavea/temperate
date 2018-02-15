import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs/Rx';

import { DownloadService } from '../core/services/download.service';
import { OrganizationService } from '../core/services/organization.service';
import { RiskService } from '../core/services/risk.service';
import { WeatherEventService } from '../core/services/weather-event.service';
import { OrgWeatherEvent, Risk, WeatherEvent } from '../shared/';
import { ModalTemplateComponent } from '../shared/modal-template/modal-template.component';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public eventsAtLastSave: OrgWeatherEvent[] = [];
  public groupedRisks: any[];
  public selectedEventsControl = new FormControl([]);


  constructor(private riskService: RiskService,
              private downloadService: DownloadService,
              private organizationService: OrganizationService,
              private weatherEventService: WeatherEventService) { }

  ngOnInit() {
    this.getGroupedRisks();
    this.weatherEventService.listForCurrentOrg().subscribe(events => {
      this.setSelectedEvents(events);
    });
  }

  cancelModal(modal: ModalTemplateComponent) {
    this.setSelectedEvents(this.eventsAtLastSave);
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
    const saves = this.saveEventsToAPI(selectedEvents);
    Observable.forkJoin(saves)
      .finally(() => this.getGroupedRisks())
      .subscribe(results => this.handleAPISave(results));
    modal.close();
  }

  get weatherEventsAtLastSave() {
    return this.eventsAtLastSave.map(e => e.weather_event);
  }

  private getGroupedRisks() {
    this.groupedRisks = undefined;
    this.riskService.groupByWeatherEvent().subscribe(r => {
      this.groupedRisks = Array.from(r.values());
    });
  }

  private setSelectedEvents(events: OrgWeatherEvent[]) {
    this.eventsAtLastSave = events;
    const weatherEvents = events.map(e => e.weather_event);
    this.selectedEventsControl.setValue(weatherEvents);
  }

  private handleAPISave(events: (number|OrgWeatherEvent)[]) {
    events.forEach(e => {
      if (typeof e === 'number') {
        const index = this.eventsAtLastSave.findIndex(event => event.id === e);
        if (index !== -1) {
          this.eventsAtLastSave.splice(index, 1);
          console.log('Removed:', e);
        }
      } else if (e && e.id) {
        this.eventsAtLastSave.push(e);
        console.log('Added:', e);
      }
    });
  }

  private saveEventsToAPI(events: WeatherEvent[]): Observable<number|OrgWeatherEvent>[] {
    // If event in events but not eventsAtLastSave, its been added
    const eventsToAdd = events.filter(e => {
      return this.eventsAtLastSave.findIndex(els => els.weather_event.id === e.id) === -1;
    });
    const addObservables = eventsToAdd.map(e => this.weatherEventService.addToCurrentOrg(e));

    // If event in eventsAtLastSave but not events, its been removed
    const eventsToRemove = this.eventsAtLastSave.filter(els => {
      return events.findIndex(e => els.weather_event.id === e.id) === -1;
    });
    const removeObservables = eventsToRemove.map(e => {
      return this.weatherEventService.removeFromCurrentOrg(e);
    });

    return (addObservables as Observable<any>[]).concat(removeObservables);
  }
}
