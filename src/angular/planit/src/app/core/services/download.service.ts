import { Injectable } from '@angular/core';

import * as papa from 'papaparse';
import { map } from 'rxjs/operators';

import { PlanItApiHttp } from './api-http.service';

@Injectable()
export class DownloadService {

  constructor(private apiHttp: PlanItApiHttp) {}

  downloadCSV(url: string, filename: string) {
    return this.apiHttp.get(url).pipe(map(resp => {
      // Parse string to array of arrays
      const csvData = papa.parse(resp['_body'], { newline: '\r\n' });

      // Convert back to a string, line returns are now handled correctly
      const csvString = papa.unparse(csvData);

      this.downloadFile(
        csvString,
        filename,
        'data:text/csv;charset=utf-8',
        'csv'
      );
    })).subscribe();
  }

  private downloadFile(data: any, filename: string, contentType: string, extension: string) {
    const blob = new Blob([data], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString();
    const fullFilename = `${filename}_${timestamp}.${extension}`;

    if (navigator.msSaveBlob) {
      // IE has a nicer interface for saving blobs
      navigator.msSaveBlob(blob, fullFilename);
    } else {
      // Other browsers have to use a hidden link hack
      a.style.display = 'none';
      a.setAttribute('download', fullFilename);
      a.setAttribute('href', url);

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    URL.revokeObjectURL(url);
  }
}
