import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/* Simple service used to comunicate from a child component to the root
 * component that the page should be shown at a fixed hieght without a footer
 */
@Injectable()
export class FullHeightService {

  private fullHeight = false;

  constructor() {}

  enable() {
    this.fullHeight = true;
  }

  disable() {
    this.fullHeight = false;
  }

  isFullHeight(): boolean {
    return this.fullHeight;
  }
}
