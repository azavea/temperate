import { Injectable } from '@angular/core';

import { PlanItApiHttp } from './api-http.service';
import { DownloadService } from './download.service';

import { environment } from '../../../environments/environment';

@Injectable()
export class PlanService {

  constructor(private apiHttp: PlanItApiHttp,
              private downloadService: DownloadService) { }

  export() {
    const url = `${environment.apiUrl}/api/plan/export/`;
    const filename = 'adaptation_plan';

    this.downloadService.downloadCSV(url, filename);
  }

  submit() {
    const url = `${environment.apiUrl}/api/plan/submit/`;
    return this.apiHttp.post(url, undefined);
  }
}
