import { Component } from '@angular/core';

import { DownloadService } from '../../core/services/download.service';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-download-csv',
  templateUrl: './download-csv.component.html'
})
export class DownloadCsvComponent {

  constructor(private downloadService: DownloadService) { }

  public downloadPlan() {
    const url = `${environment.apiUrl}/api/export-plan/`;
    const filename = 'adaptation_plan';

    this.downloadService.downloadCSV(url, filename);
  }
}
